import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';
import { connectSocket, getSocket } from '../services/socket';

const buildRoomId = (userId, contactId) => [userId, contactId].sort().join('_');

const getStoredConversations = (userId) => {
    if (!userId) return {};

    try {
        const stored = localStorage.getItem(`chat-conversations-${userId}`);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const saveStoredConversation = (userId, contactId, payload) => {
    if (!userId || !contactId) return;

    const nextStore = getStoredConversations(userId);
    nextStore[contactId] = payload;
    localStorage.setItem(`chat-conversations-${userId}`, JSON.stringify(nextStore));
};

export const useChat = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [activeContactId, setActiveContactId] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [joinedRoom, setJoinedRoom] = useState(null);

    const currentUserId = user?.id || user?._id || null;

    // Initialize socket connection first
    useEffect(() => {
        if (!user) return;
        
        connectSocket();
    }, [user]);

    // Load all available users from database
    useEffect(() => {
        if (!user) return;

        const loadContacts = async () => {
            try {
                const { data } = await getUsers();
                const storedConversations = getStoredConversations(currentUserId);
                const otherUsers = (data.users || []).filter((entry) => entry.id !== currentUserId && entry._id !== currentUserId);

                const nextContacts = otherUsers.map((entry) => {
                    const contactId = entry.id || entry._id;
                    const stored = storedConversations[contactId];

                    return {
                        id: contactId,
                        name: entry.name,
                        email: entry.email,
                        avatar: entry.avatar,
                        status: 'offline',
                        unreadCount: 0,
                        messages: stored?.messages || [],
                        lastMessage: stored?.lastMessage || null,
                        lastMessageTime: stored?.lastMessageTime || null,
                    };
                });

                setAllUsers(nextContacts);
                setContacts((prevContacts) => {
                    const existingById = new Map(prevContacts.map((contact) => [contact.id, contact]));
                    return nextContacts.map((entry) => {
                        const existing = existingById.get(entry.id);
                        return {
                            ...entry,
                            messages: entry.messages?.length ? entry.messages : (existing?.messages || []),
                            lastMessage: entry.lastMessage || existing?.lastMessage || null,
                            lastMessageTime: entry.lastMessageTime || existing?.lastMessageTime || null,
                            unreadCount: existing?.unreadCount || 0,
                            status: existing?.status || 'offline',
                        };
                    });
                });

                if (!activeContactId && nextContacts[0]) {
                    setActiveContactId(nextContacts[0].id);
                }
            } catch (error) {
                console.error('Could not load users', error);
            }
        };

        const timer = setTimeout(() => {
            loadContacts();
        }, 500);

        const interval = setInterval(loadContacts, 30000);
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [currentUserId, user]);

    // Manage socket connections and real-time events
    useEffect(() => {
        if (!user) return;

        const socket = connectSocket();
        socket.emit('register-user', {
            userId: currentUserId,
            name: user.name,
            email: user.email,
        });

        socket.on('users-online', (users) => {
            setOnlineUsers(users.map((entry) => entry.userId));
        });

        socket.on('user-online', ({ userId }) => {
            setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
        });

        socket.on('user-offline', ({ userId }) => {
            setOnlineUsers((prev) => prev.filter((entry) => entry !== userId));
        });

        socket.on('receive-message', (message) => {
            const otherUserId = message.senderId === currentUserId ? message.recipientId : message.senderId;

            setContacts((prevContacts) =>
                prevContacts.map((contact) => {
                    if (contact.id !== otherUserId) {
                        return contact;
                    }

                    const messageId = message.id || `${message.senderId}-${message.timestamp}`;
                    const alreadyExists = contact.messages.some((item) => item.id === messageId);
                    if (alreadyExists) {
                        return contact;
                    }

                    const newMessage = {
                        id: messageId,
                        senderId: message.senderId === currentUserId ? 'me' : message.senderId,
                        text: message.text,
                        timestamp: new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };

                    const nextMessages = [...contact.messages, newMessage];
                    saveStoredConversation(currentUserId, otherUserId, {
                        messages: nextMessages,
                        lastMessage: message.text,
                        lastMessageTime: new Date(message.timestamp),
                    });

                    return {
                        ...contact,
                        messages: nextMessages,
                        lastMessage: message.text,
                        lastMessageTime: new Date(message.timestamp),
                    };
                })
            );
        });

        socket.on('message-history', (messages) => {
            const activeContactIdLocal = activeContactId;
            if (!activeContactIdLocal) return;

            const formattedMessages = messages.map((msg) => ({
                id: `history-${msg._id}`,
                senderId: msg.senderId === currentUserId ? 'me' : msg.senderId,
                text: msg.text,
                timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            setContacts((prevContacts) =>
                prevContacts.map((contact) => {
                    if (contact.id !== activeContactIdLocal) {
                        return contact;
                    }
                    const nextLastMessageTime = messages.at(-1)?.createdAt ? new Date(messages.at(-1).createdAt) : contact.lastMessageTime;
                    const nextPayload = {
                        messages: formattedMessages,
                        lastMessage: formattedMessages.at(-1)?.text || contact.lastMessage,
                        lastMessageTime: nextLastMessageTime,
                    };
                    saveStoredConversation(currentUserId, activeContactIdLocal, nextPayload);

                    return {
                        ...contact,
                        ...nextPayload,
                    };
                })
            );
        });

        return () => {
            socket.off('users-online');
            socket.off('user-online');
            socket.off('user-offline');
            socket.off('receive-message');
            socket.off('message-history');
        };
    }, [currentUserId, user]);

    // Join chat room when active contact changes
    useEffect(() => {
        if (!currentUserId || !activeContactId) return;

        const socket = getSocket();
        const roomId = buildRoomId(currentUserId, activeContactId);

        socket.emit('join-chat', { userId: currentUserId, contactId: activeContactId });
        setJoinedRoom(roomId);
    }, [activeContactId, currentUserId]);

    const activeContact = useMemo(() => contacts.find((contact) => contact.id === activeContactId), [activeContactId, contacts]);

    const selectContact = (id) => {
        setActiveContactId(id);
        setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, unreadCount: 0 } : contact)));
    };

    const sendMessage = (text) => {
        if (!text.trim() || !activeContactId || !currentUserId) return;

        const socket = getSocket();
        const roomId = buildRoomId(currentUserId, activeContactId);
        const timestamp = new Date().toISOString();

        const message = {
            id: `msg-${Date.now()}`,
            senderId: currentUserId,
            recipientId: activeContactId,
            roomId,
            text,
            timestamp,
        };

        socket.emit('send-message', message);
    };

    // Search/filter users
    const filteredContacts = useMemo(() => {
        if (!searchQuery.trim()) {
            return contacts.sort((a, b) => {
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
                return timeB - timeA;
            });
        }
        return contacts.filter((contact) =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [contacts, searchQuery]);

    return {
        contacts: filteredContacts.map((contact) => ({
            ...contact,
            status: onlineUsers.includes(contact.id) ? 'online' : 'offline',
        })),
        allUsers,
        activeContact,
        activeContactId,
        selectContact,
        sendMessage,
        searchQuery,
        setSearchQuery,
        joinedRoom,
    };
};