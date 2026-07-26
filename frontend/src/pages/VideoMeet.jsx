import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import { useAuth } from "../context/AuthContext";
import BottomBar from "../components/layout/BottomBar";
import { getUsers } from "../services/api";
import { getSocket } from "../services/socket";

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24,
        },
    },
};

const VideoMeet = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const currentUserId = user?.id || user?._id || null;

    useEffect(() => {
        if (!user) return;

        const loadContacts = async () => {
            try {
                setLoading(true);
                const { data } = await getUsers();
                const otherUsers = (data.users || []).filter(
                    (entry) => entry.id !== currentUserId && entry._id !== currentUserId
                );

                const mapped = otherUsers.map((entry) => ({
                    id: entry.id || entry._id,
                    name: entry.name,
                    email: entry.email,
                    avatar: entry.avatar,
                    status: "offline",
                }));

                setContacts(mapped);
            } catch (error) {
                console.error("Could not load contacts for video page", error);
            } finally {
                setLoading(false);
            }
        };

        loadContacts();
    }, [currentUserId, user]);

    // Listen for online users
    useEffect(() => {
        const socket = getSocket();

        const handleOnline = (users) => {
            setOnlineUsers(users.map((entry) => entry.userId));
        };
        const handleUserOnline = ({ userId }) => {
            setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
        };
        const handleUserOffline = ({ userId }) => {
            setOnlineUsers((prev) => prev.filter((entry) => entry !== userId));
        };

        socket.on("users-online", handleOnline);
        socket.on("user-online", handleUserOnline);
        socket.on("user-offline", handleUserOffline);

        return () => {
            socket.off("users-online", handleOnline);
            socket.off("user-online", handleUserOnline);
            socket.off("user-offline", handleUserOffline);
        };
    }, []);

    const contactsWithStatus = contacts.map((contact) => ({
        ...contact,
        status: onlineUsers.includes(contact.id) ? "online" : "offline",
    }));

    const startCall = (contact) => {
        navigate("/call", { state: { contact } });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100">
            {/* Glassmorphism Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
            >
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => navigate("/")}
                    aria-label="Back to chats"
                    className="rounded-full bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                </motion.button>
                <div>
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">Video Calls</h1>
                    <p className="text-xs text-slate-500 font-medium">Connect with online contacts</p>
                </div>
            </motion.header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl w-full mx-auto">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-64 gap-3 text-slate-400"
                        >
                            <Loader2 size={32} className="animate-spin text-emerald-500" />
                            <p className="text-sm font-medium text-slate-500">Loading contacts...</p>
                        </motion.div>
                    ) : contactsWithStatus.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center h-80 text-center px-6"
                        >
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5 shadow-inner">
                                <Users size={32} className="text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">No contacts available</h2>
                            <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                                Add contacts to start video calling with friends and colleagues.
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => navigate("/")}
                                className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 font-semibold text-sm text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                            >
                                Back to chats
                            </motion.button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="contacts-list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-3"
                        >
                            {contactsWithStatus.map((contact) => {
                                const isOnline = contact.status === "online";

                                return (
                                    <motion.div
                                        key={contact.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -2 }}
                                        className="flex items-center gap-3.5 rounded-2xl bg-white border border-slate-200/70 p-3.5 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="relative">
                                            <Avatar
                                                src={contact.avatar}
                                                name={contact.name}
                                                size="md"
                                                status={contact.status}
                                            />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-[15px] font-semibold text-slate-800 truncate tracking-tight">
                                                {contact.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span 
                                                    className={`w-2 h-2 rounded-full ${
                                                        isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                                                    }`} 
                                                />
                                                <p className="text-xs font-medium truncate">
                                                    {isOnline ? (
                                                        <span className="text-emerald-600">Online</span>
                                                    ) : (
                                                        <span className="text-slate-400">Offline</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <motion.button
                                            whileHover={isOnline ? { scale: 1.05 } : {}}
                                            whileTap={isOnline ? { scale: 0.95 } : {}}
                                            onClick={() => startCall(contact)}
                                            disabled={!isOnline}
                                            className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                                                isOnline
                                                    ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20"
                                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            }`}
                                        >
                                            <Video size={16} />
                                            <span className="hidden sm:inline">Call</span>
                                        </motion.button>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomBar />
        </div>
    );
};

export default VideoMeet;