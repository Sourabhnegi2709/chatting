import React from "react";
import {
    User,
    Users,
    Star,
    Settings,
    LogOut,
    ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        {
            title: "Profile",
            icon: <User size={20} />,
            action: () => navigate("/profile"),
        },
        {
            title: "New Group",
            icon: <Users size={20} />,
            action: () => navigate("/group"),
        },
        {
            title: "Starred Messages",
            icon: <Star size={20} />,
            action: () => navigate("/starred"),
        },
        {
            title: "Settings",
            icon: <Settings size={20} />,
            action: () => navigate("/settings"),
        },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/auth");
    };

    return (
        <div className="min-h-screen bg-zinc-100 p-4">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-zinc-200 overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-zinc-200 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                        {user?.name?.charAt(0) || "U"}
                    </div>

                    <div>
                        <h2 className="font-semibold text-zinc-900 text-lg">
                            {user?.name || "Guest User"}
                        </h2>

                        <p className="text-sm text-zinc-500">
                            {user?.email || "No email"}
                        </p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="divide-y divide-zinc-200">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.action}
                            className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition"
                        >
                            <div className="flex items-center gap-3 text-zinc-800">
                                {item.icon}
                                <span>{item.title}</span>
                            </div>

                            <ChevronRight size={18} className="text-zinc-400" />
                        </button>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-4">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Menu;