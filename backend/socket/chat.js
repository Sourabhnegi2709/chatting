import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { corsOriginHandler } from '../config/cors.js';
import { env } from '../config/env.js';
import Meeting from '../models/meeting.model.js';
import Message from '../models/message.model.js';

const HISTORY_PAGE_SIZE = 50;

// socketId -> { userId, name, email }
const socketUsers = new Map();
// userId -> Set<socketId>  (supports the same user connected from multiple devices/tabs)
const userSocketMap = new Map();
// callId -> { callerId, recipientId, status, startedAt }
const activeCalls = new Map();

const buildRoomId = (userId, contactId) => [userId, contactId].sort().join('_');
const buildCallId = (userId, contactId) => [userId, contactId].sort().join('_');

const addUserSocket = (userId, socketId) => {
    if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());
    userSocketMap.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
    const set = userSocketMap.get(userId);
    if (!set) return false;
    set.delete(socketId);
    const nowEmpty = set.size === 0;
    if (nowEmpty) userSocketMap.delete(userId);
    return nowEmpty; // true = user has no more open connections anywhere
};

const getOnlineUsers = () => {
    const seen = new Map();
    for (const entry of socketUsers.values()) {
        if (entry.userId) seen.set(entry.userId, entry); // de-dupe multi-device entries
    }
    return Array.from(seen.values());
};

/**
 * Optional horizontal-scaling hook. If REDIS_URL is set, events broadcast
 * from one server instance (e.g. `io.to(roomId).emit(...)`) automatically
 * reach clients connected to *other* instances behind the same load
 * balancer. Requires: npm install @socket.io/redis-adapter redis
 * Without REDIS_URL set, this is a no-op and everything runs single-instance.
 */
const attachRedisAdapterIfConfigured = async (io) => {
    if (!env.REDIS_URL) return;

    try {
        const [{ createAdapter }, { createClient }] = await Promise.all([
            import('@socket.io/redis-adapter'),
            import('redis'),
        ]);

        const pubClient = createClient({ url: env.REDIS_URL });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.IO Redis adapter attached — ready for multi-instance scaling.');
    } catch (err) {
        console.error(
            '⚠️  REDIS_URL is set but the Redis adapter could not be attached ' +
            '(did you `npm install @socket.io/redis-adapter redis`?). ' +
            'Continuing in single-instance mode.',
            err.message
        );
    }
};

const connectToSocket = async (server) => {
    const io = new Server(server, {
        cors: {
            origin: corsOriginHandler,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    await attachRedisAdapterIfConfigured(io);

    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: ${socket.id}`);

        socket.emit('users-online', getOnlineUsers());

        socket.on('register-user', ({ userId, name, email }) => {
            if (!userId) return;

            socketUsers.set(socket.id, { socketId: socket.id, userId, name, email });
            addUserSocket(userId, socket.id);

            io.emit('users-online', getOnlineUsers());
            socket.broadcast.emit('user-online', { userId, name, email });
            console.log(`👤 User registered: ${name} (${userId}) [socket ${socket.id}]`);
        });

        socket.on('join-chat', async ({ userId, contactId }) => {
            if (!userId || !contactId) return;

            const roomId = buildRoomId(userId, contactId);
            socket.join(roomId);
            socket.emit('joined-chat', { roomId });

            if (mongoose.connection.readyState === 1) {
                try {
                    const recent = await Message.find({ roomId })
                        .sort({ _id: -1 })
                        .limit(HISTORY_PAGE_SIZE)
                        .lean();

                    socket.emit('message-history', recent.reverse());
                } catch (err) {
                    console.error('Error loading message history:', err);
                    socket.emit('message-history-error', { roomId, error: 'Failed to load history' });
                }
            }
        });

        // Infinite-scroll: client sends the oldest message id it currently has.
        socket.on('load-more-messages', async ({ roomId, beforeMessageId }) => {
            if (!roomId || mongoose.connection.readyState !== 1) return;

            try {
                const filter = { roomId };
                if (beforeMessageId && mongoose.isValidObjectId(beforeMessageId)) {
                    filter._id = { $lt: beforeMessageId };
                }

                const older = await Message.find(filter)
                    .sort({ _id: -1 })
                    .limit(HISTORY_PAGE_SIZE)
                    .lean();

                socket.emit('more-messages', {
                    roomId,
                    messages: older.reverse(),
                    hasMore: older.length === HISTORY_PAGE_SIZE,
                });
            } catch (err) {
                console.error('Error loading more messages:', err);
            }
        });

        socket.on('send-message', async (message) => {
            const { roomId, senderId, recipientId, text } = message || {};
            if (!roomId || !senderId || !recipientId || !text?.trim()) return;

            let saved = null;
            if (mongoose.connection.readyState === 1) {
                try {
                    saved = await Message.create({ senderId, recipientId, text: text.trim(), roomId });
                } catch (err) {
                    console.error('Error saving message:', err);
                    socket.emit('message-error', {
                        tempId: message.id,
                        error: 'Failed to save message. Please try again.',
                    });
                    return; // don't broadcast a message that failed to persist
                }
            }

            const payload = {
                id: saved?._id?.toString?.() || message.id,
                senderId,
                recipientId,
                roomId,
                text: text.trim(),
                status: saved?.status || 'sent',
                timestamp: message.timestamp || saved?.createdAt || new Date().toISOString(),
            };

            io.to(roomId).emit('receive-message', payload);
        });

        socket.on('typing-start', ({ roomId, userId }) => {
            if (roomId) socket.to(roomId).emit('user-typing', { roomId, userId });
        });

        socket.on('typing-stop', ({ roomId, userId }) => {
            if (roomId) socket.to(roomId).emit('user-stopped-typing', { roomId, userId });
        });

        // ===== VIDEO/AUDIO CALL HANDLERS =====

        socket.on('start-call', async ({ recipientUserId, caller, offer }) => {
            console.log(`📞 Call initiated from ${caller.id} to ${recipientUserId}`);
            const recipientSocketIds = userSocketMap.get(recipientUserId);

            if (recipientSocketIds?.size) {
                const callId = buildCallId(caller.id, recipientUserId);
                activeCalls.set(callId, {
                    callId,
                    callerId: caller.id,
                    callerName: caller.name,
                    recipientId: recipientUserId,
                    status: 'ringing',
                    startTime: new Date(),
                });

                if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(caller.id) && mongoose.isValidObjectId(recipientUserId)) {
                    Meeting.create({
                        callId,
                        callerId: caller.id,
                        recipientId: recipientUserId,
                        status: 'ringing',
                    }).catch((err) => console.error('Error logging call start:', err));
                }

                for (const sid of recipientSocketIds) {
                    io.to(sid).emit('incoming-call', { callId, caller, offer });
                }
                socket.emit('call-ringing', { callId });
            } else {
                socket.emit('call-failed', { error: 'User offline' });
            }
        });

        socket.on('accept-call', ({ callId, answer }) => {
            console.log(`✅ Call accepted: ${callId}`);

            if (!activeCalls.has(callId)) return;

            const callData = activeCalls.get(callId);
            callData.status = 'connected';

            Meeting.updateOne({ callId }, { $set: { status: 'connected' } }).catch((err) =>
                console.error('Error logging call accept:', err)
            );

            const callerSocketIds = userSocketMap.get(callData.callerId);
            if (callerSocketIds?.size) {
                for (const sid of callerSocketIds) {
                    io.to(sid).emit('call-accepted', { callId, answer });
                }
            } else {
                socket.emit('call-error', { callId, error: 'Caller disconnected' });
            }
        });

        socket.on('reject-call', ({ callId, recipientUserId }) => {
            console.log(`❌ Call rejected: ${callId}`);
            const callData = activeCalls.get(callId);
            const targetId = recipientUserId || callData?.callerId;
            const targetSocketIds = userSocketMap.get(targetId);

            if (targetSocketIds?.size) {
                for (const sid of targetSocketIds) {
                    io.to(sid).emit('call-rejected', { callId });
                }
            }

            Meeting.updateOne({ callId }, { $set: { status: 'rejected', endedAt: new Date() } }).catch((err) =>
                console.error('Error logging call reject:', err)
            );
            activeCalls.delete(callId);
        });

        socket.on('ice-candidate', ({ callId, recipientUserId, candidate }) => {
            const recipientSocketIds = userSocketMap.get(recipientUserId);
            if (recipientSocketIds?.size) {
                for (const sid of recipientSocketIds) {
                    io.to(sid).emit('ice-candidate', { callId, candidate });
                }
            }
        });

        socket.on('end-call', ({ callId, recipientUserId }) => {
            console.log(`📞 Call ended: ${callId}`);
            const recipientSocketIds = userSocketMap.get(recipientUserId);
            if (recipientSocketIds?.size) {
                for (const sid of recipientSocketIds) {
                    io.to(sid).emit('call-ended', { callId });
                }
            }

            if (activeCalls.has(callId)) {
                const callData = activeCalls.get(callId);
                const durationSeconds = Math.floor((new Date() - callData.startTime) / 1000);
                console.log(`   Duration: ${durationSeconds} seconds`);

                Meeting.updateOne(
                    { callId },
                    { $set: { status: 'ended', endedAt: new Date(), durationSeconds } }
                ).catch((err) => console.error('Error logging call end:', err));

                activeCalls.delete(callId);
            }
        });

        socket.on('call-error', ({ callId, recipientUserId, error }) => {
            console.error(`❌ Call error (${callId}):`, error);
            const recipientSocketIds = userSocketMap.get(recipientUserId);
            if (recipientSocketIds?.size) {
                for (const sid of recipientSocketIds) {
                    io.to(sid).emit('call-error', { callId, error });
                }
            }

            Meeting.updateOne({ callId }, { $set: { status: 'failed', endedAt: new Date() } }).catch(() => {});
            activeCalls.delete(callId);
        });

        socket.on('disconnect', () => {
            const user = socketUsers.get(socket.id);
            socketUsers.delete(socket.id);

            if (user?.userId) {
                const fullyOffline = removeUserSocket(user.userId, socket.id);

                if (fullyOffline) {
                    // End any active calls involving this user only once ALL of their
                    // tabs/devices have disconnected.
                    const callsToEnd = Array.from(activeCalls.entries()).filter(
                        ([, callData]) => callData.callerId === user.userId || callData.recipientId === user.userId
                    );

                    for (const [callId, callData] of callsToEnd) {
                        const otherUserId = callData.callerId === user.userId ? callData.recipientId : callData.callerId;
                        const otherSocketIds = userSocketMap.get(otherUserId);
                        if (otherSocketIds?.size) {
                            for (const sid of otherSocketIds) {
                                io.to(sid).emit('call-ended', { callId, reason: 'user-disconnected' });
                            }
                        }
                        Meeting.updateOne(
                            { callId },
                            { $set: { status: 'ended', endedAt: new Date() } }
                        ).catch(() => {});
                        activeCalls.delete(callId);
                    }

                    socket.broadcast.emit('user-offline', { userId: user.userId });
                    io.emit('users-online', getOnlineUsers());
                }
            }

            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default connectToSocket;
