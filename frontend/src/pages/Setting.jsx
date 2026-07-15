import {
    Bell,
    LogOut,
    Moon,
    Pencil,
    Shield,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import BottomBar from "../components/layout/BottomBar";

const Setting = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [lastSeen, setLastSeen] = useState(true);

    // Load settings from localStorage
    useEffect(() => {
        const savedDark = localStorage.getItem("darkMode");
        const savedNotify = localStorage.getItem("notifications");
        const savedLastSeen = localStorage.getItem("lastSeen");

        if (savedDark !== null) {
            setDarkMode(JSON.parse(savedDark));
        }

        if (savedNotify !== null) {
            setNotifications(JSON.parse(savedNotify));
        }

        if (savedLastSeen !== null) {
            setLastSeen(JSON.parse(savedLastSeen));
        }
    }, []);

    // Save settings
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
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-100 p-4 md:p-6">
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-800 rounded-2xl shadow-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-700">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                        Settings
                    </h1>

                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage your profile and app settings
                    </p>
                </div>

                {/* Profile Section */}
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-300 flex items-center justify-center">
                            <User size={28} />
                        </div>

                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {user?.name || "Guest User"}
                            </h2>

                            <p className="text-sm text-zinc-500">
                                {user?.email || "No email available"}
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
                        >
                            <Pencil size={16} />
                            Edit
                        </button>
                    </div>
                </div>

                {/* Settings */}
                <div className="divide-y divide-zinc-200 dark:divide-zinc-700">

                    {/* Dark Mode */}
                    <SettingItem
                        icon={<Moon size={20} />}
                        title="Dark Mode"
                        state={darkMode}
                        onClick={() => setDarkMode(!darkMode)}
                    />

                    {/* Notifications */}
                    <SettingItem
                        icon={<Bell size={20} />}
                        title="Notifications"
                        state={notifications}
                        onClick={() =>
                            setNotifications(!notifications)
                        }
                    />

                    {/* Last Seen */}
                    <SettingItem
                        icon={<Shield size={20} />}
                        title="Show Last Seen"
                        state={lastSeen}
                        onClick={() => setLastSeen(!lastSeen)}
                    />

                    {/* Change Password */}
                    {/* <button
                        onClick={() => navigate("/change-password")}
                        className="w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                    >
                        <div className="flex items-center gap-3">
                            <KeyRound size={20} />
                            <span>Change Password</span>
                        </div>
                    </button> */}
                </div>

                {/* Logout */}
                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            <BottomBar/>
        </div>
    );
};

const SettingItem = ({ icon, title, state, onClick }) => {
    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-zinc-800 dark:text-white">
                {icon}
                <span className="font-medium">{title}</span>
            </div>

            <button
                onClick={onClick}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    state ? "bg-green-500" : "bg-zinc-300"
                }`}
            >
                <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                        state ? "translate-x-6" : ""
                    }`}
                />
            </button>
        </div>
    );
};

export default Setting;