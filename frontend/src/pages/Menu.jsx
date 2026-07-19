import React from "react";
import { User, Users, Star, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/ui/Avatar";

const Menu = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { title: "Profile", icon: User, action: () => navigate("/profile") },
        { title: "New Group", icon: Users, action: () => navigate("/group") },
        { title: "Starred Messages", icon: Star, action: () => navigate("/starred") },
        { title: "Settings", icon: Settings, action: () => navigate("/settings") },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-zinc-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center gap-4">
                    <Avatar name={user?.name || "Guest"} size="xl" />
                    <div>
                        <h2 className="font-semibold text-zinc-900 text-lg">
                            {user?.name || "Guest User"}
                        </h2>
                        <p className="text-sm text-zinc-500">{user?.email || "No email"}</p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="divide-y divide-zinc-100">
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={item.action}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 active:bg-zinc-100 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-zinc-800">
                                <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <item.icon size={18} />
                                </span>
                                <span className="text-sm font-medium">{item.title}</span>
                            </div>
                            <ChevronRight size={18} className="text-zinc-300" />
                        </motion.button>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 active:scale-[0.98] text-red-600 font-medium py-3 rounded-xl transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Menu;
