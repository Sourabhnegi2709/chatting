import React from "react";
import { User, Users, Star, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";
import BottomBar from "../components/layout/BottomBar";

const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            staggerChildren: 0.06,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Menu = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { title: "Profile", icon: User, action: () => navigate("/profile") },
        { title: "New Group", icon: Users, action: () => navigate("/") },
        { title: "Starred Messages", icon: Star, action: () => navigate("/") },
        { title: "Settings", icon: Settings, action: () => navigate("/settings") },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/auth");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100">
            {/* Scrollable Main Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 pb-24">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden"
                >
                    {/* Header Card */}
                    <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
                        <div className="relative">
                            <Avatar name={user?.name || "Guest"} size="xl" />
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-bold text-slate-800 text-lg tracking-tight truncate">
                                {user?.name || "Guest User"}
                            </h2>
                            <p className="text-xs font-medium text-slate-500 truncate">
                                {user?.email || "No email linked"}
                            </p>
                        </div>
                    </div>

                    {/* Interactive Menu List */}
                    <div className="divide-y divide-slate-100 p-2">
                        {menuItems.map((item, index) => (
                            <motion.button
                                key={index}
                                variants={itemVariants}
                                whileHover={{ x: 3 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 active:bg-slate-100/80 transition-all text-left group"
                            >
                                <div className="flex items-center gap-3.5 text-slate-700">
                                    <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white shadow-xs">
                                        <item.icon size={18} />
                                    </span>
                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                        {item.title}
                                    </span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                            </motion.button>
                        ))}
                    </div>

                    {/* Logout Action */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100/80 text-red-600 text-xs font-bold py-3 px-4 rounded-2xl transition-all border border-red-100 shadow-xs"
                        >
                            <LogOut size={16} />
                            Logout Account
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Pinned Bottom Navigation */}
            <BottomBar />
        </div>
    );
};

export default Menu;