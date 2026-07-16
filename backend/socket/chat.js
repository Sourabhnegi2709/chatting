import mongoose from 'mongoose';
import { Server } from 'socket.io';
import Message from '../models/message.model.js';

const users = new Map();
const rooms = new Map();
const userSocketMap = new Map();
const activeCalls = new Map(); // Track active calls: callId -> { caller, recipient, status }

const buildRoomId = (userId, contactId) => [userId, contactId].sort().join('_');
const buildCallId = (userId, contactId) => [userId, contactId].sort().join('_');

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    'https://chatting-azure-five.vercel.app',

                ];
                if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):517\d+$/.test(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: ${socket.id}`);

        // Send current online users to newly connected client
        const currentOnlineUsers = Array.from(users.values()).filter((entry) => entry.userId);
        socket.emit('users-online', currentOnlineUsers);

        socket.on('register-user', ({ userId, name, email }) => {
            users.set(socket.id, { socketId: socket.id, userId, name, email });
            if (userId) {
                userSocketMap.set(userId, socket.id);
            }
            const onlineUsers = Array.from(users.values()).filter((entry) => entry.userId);
            io.emit('users-online', onlineUsers);
            socket.broadcast.emit('user-online', { userId, name, email });
            console.log(`👤 User registered: ${name} (${userId})`);
        });

        socket.on('join-chat', async ({ userId, contactId }) => {
            const roomId = buildRoomId(userId, contactId);
            socket.join(roomId);
            rooms.set(socket.id, roomId);
            socket.emit('joined-chat', { roomId });

            // Load message history from database if available
            if (mongoose.connection.readyState === 1) {
                try {
                    const history = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();
                    if (history.length > 0) {
                        socket.emit('message-history', history);
                    }
                } catch (err) {
                    console.error('Error loading message history:', err);
                }
            }
        });

        socket.on('send-message', async (message) => {
            const roomId = message.roomId;
            if (!roomId) return;

            const payload = {
                id: message.id,
                senderId: message.senderId,
                recipientId: message.recipientId,
                roomId,
                text: message.text,
                timestamp: message.timestamp,
            };

            if (mongoose.connection.readyState === 1) {
                try {
                    await Message.create({
                        senderId: message.senderId,
                        recipientId: message.recipientId,
                        text: message.text,
                        roomId: message.roomId,
                    });
                } catch (err) {
                    console.error('Error saving message:', err);
                }
            }

            socket.emit('receive-message', payload);
            socket.to(roomId).emit('receive-message', payload);
        });






        // ===== VIDEO/AUDIO CALL HANDLERS =====
        
        socket.on('start-call', ({ recipientUserId, caller, offer }) => {
            console.log(`📞 Call initiated from ${caller.id} to ${recipientUserId}`);
            const recipientSocketId = userSocketMap.get(recipientUserId);
            if (recipientSocketId) {
                const callId = buildCallId(caller.id, recipientUserId);
                activeCalls.set(callId, {
                    callId,
                    callerId: caller.id,
                    callerName: caller.name,
                    recipientId: recipientUserId,
                    status: 'ringing',
                    startTime: new Date(),
                });
                io.to(recipientSocketId).emit('incoming-call', {
                    callId,
                    caller,
                    offer,
                });
                socket.emit('call-ringing', { callId });
            } else {
                socket.emit('call-failed', { error: 'User offline' });
            }
        });

        socket.on('accept-call', ({ callId, answer }) => {   // recipientUserId not really needed
    console.log(`✅ Call accepted: ${callId}`);
    
    if (!activeCalls.has(callId)) return;
    
    const callData = activeCalls.get(callId);
    callData.status = 'connected';

    // Send answer to the CALLER, not to the recipient
    const callerSocketId = userSocketMap.get(callData.callerId);
    
    if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', { 
            callId, 
            answer 
        });
    } else {
        // Fallback: notify both sides something went wrong
        socket.emit('call-error', { callId, error: 'Caller disconnected' });
    }
});

        socket.on('reject-call', ({ callId, recipientUserId }) => {
            console.log(`❌ Call rejected: ${callId}`);
            const recipientSocketId = userSocketMap.get(recipientUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('call-rejected', { callId });
            }
            activeCalls.delete(callId);
        });

        socket.on('ice-candidate', ({ callId, recipientUserId, candidate }) => {
            const recipientSocketId = userSocketMap.get(recipientUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('ice-candidate', { callId, candidate });
            }
        });

        socket.on('end-call', ({ callId, recipientUserId }) => {
            console.log(`📞 Call ended: ${callId}`);
            const recipientSocketId = userSocketMap.get(recipientUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('call-ended', { callId });
            }
            if (activeCalls.has(callId)) {
                const callData = activeCalls.get(callId);
                const duration = (new Date() - callData.startTime) / 1000;
                console.log(`   Duration: ${Math.floor(duration)} seconds`);
                activeCalls.delete(callId);
            }
        });

        socket.on('call-error', ({ callId, recipientUserId, error }) => {
            console.error(`❌ Call error (${callId}):`, error);
            const recipientSocketId = userSocketMap.get(recipientUserId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('call-error', { callId, error });
            }
            activeCalls.delete(callId);
        });

        socket.on('disconnect', () => {
            const user = users.get(socket.id);
            if (user) {
                users.delete(socket.id);
                if (user.userId) {
                    userSocketMap.delete(user.userId);
                    
                    // End any active calls involving this user
                    const callsToEnd = Array.from(activeCalls.entries()).filter(
                        ([_, callData]) => callData.callerId === user.userId || callData.recipientId === user.userId
                    );
                    
                    for (const [callId, callData] of callsToEnd) {
                        const otherUserId = callData.callerId === user.userId ? callData.recipientId : callData.callerId;
                        const otherSocketId = userSocketMap.get(otherUserId);
                        if (otherSocketId) {
                            io.to(otherSocketId).emit('call-ended', { callId, reason: 'user-disconnected' });
                        }
                        activeCalls.delete(callId);
                    }
                }
                socket.broadcast.emit('user-offline', { userId: user.userId });
                io.emit('users-online', Array.from(users.values()).filter((entry) => entry.userId));
            }
            rooms.delete(socket.id);
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });
};

export default connectToSocket;

