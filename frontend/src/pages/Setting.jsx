import { motion } from "framer-motion";
import { Bell, LogOut, Moon, Pencil, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomBar from "../components/layout/BottomBar";
import { useAuth } from "../context/AuthContext";

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Setting = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [lastSeen, setLastSeen] = useState(true);

    useEffect(() => {
        const savedDark = localStorage.getItem("darkMode");
        const savedNotify = localStorage.getItem("notifications");
        const savedLastSeen = localStorage.getItem("lastSeen");

        if (savedDark !== null) setDarkMode(JSON.parse(savedDark));
        if (savedNotify !== null) setNotifications(JSON.parse(savedNotify));
        if (savedLastSeen !== null) setLastSeen(JSON.parse(savedLastSeen));
    }, []);

    useEffect(() => {
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
        document.documentElement.classList.toggle("dark", darkMode);
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem("lastSeen", JSON.stringify(lastSeen));
    }, [lastSeen]);

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-6 pb-24 font-sans selection:bg-emerald-100 transition-colors">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden"
            >
                {/* Header */}
                <div className="px-6 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                        Manage your profile and preference settings
                    </p>
                </div>

                {/* Profile Card Section */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20"
                        >
                            <User size={28} />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-slate-800 truncate tracking-tight">
                                {user?.name || "Guest User"}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium truncate">
                                {user?.email || "No email available"}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-colors"
                        >
                            <Pencil size={15} />
                            <span>Edit</span>
                        </motion.button>
                    </div>
                </div>

                {/* Section Title */}
                <div className="px-6 pt-6 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Preferences & Privacy
                    </h3>
                </div>

                {/* Setting Items */}
                <div className="divide-y divide-slate-100 px-2">
                    <SettingItem 
                        icon={<Moon size={18} className="text-slate-600" />} 
                        title="Dark Mode" 
                        state={darkMode} 
                        onClick={() => setDarkMode(!darkMode)} 
                    />
                    <SettingItem 
                        icon={<Bell size={18} className="text-slate-600" />} 
                        title="Notifications" 
                        state={notifications} 
                        onClick={() => setNotifications(!notifications)} 
                    />
                    <SettingItem 
                        icon={<Shield size={18} className="text-slate-600" />} 
                        title="Show Last Seen" 
                        state={lastSeen} 
                        onClick={() => setLastSeen(!lastSeen)} 
                    />
                </div>

                {/* Logout Button */}
                <div className="p-6 pt-4">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm py-3 rounded-2xl border border-red-100 transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </motion.button>
                </div>
            </motion.div>

            <BottomBar />
        </div>
    );
};

const SettingItem = ({ icon, title, state, onClick }) => {
    return (
        <motion.div 
            variants={itemVariants}
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-slate-50 transition-colors"
        >
            <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center">
                    {icon}
                </div>
                <span className="font-semibold text-sm text-slate-800">{title}</span>
            </div>

            {/* Custom Smooth Animated Switch Toggle */}
            <button
                onClick={onClick}
                aria-pressed={state}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-hidden ${
                    state ? "bg-emerald-500" : "bg-slate-200"
                }`}
            >
                <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`w-4 h-4 bg-white rounded-full shadow-sm ${
                        state ? "translate-x-6" : "translate-x-0"
                    }`}
                />
            </button>
        </motion.div>
    );
};

export default Setting;