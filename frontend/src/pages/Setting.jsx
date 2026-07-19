import { Bell, LogOut, Moon, Pencil, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomBar from "../components/layout/BottomBar";
import { useAuth } from "../context/AuthContext";

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
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 p-4 md:p-6 pb-24 transition-colors">
            <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-colors">

                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Settings</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Manage your profile and app settings
                    </p>
                </div>

                {/* Profile Section */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white">
                            <User size={28} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {user?.name || "Guest User"}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {user?.email || "No email available"}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/profile")}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-medium transition-all"
                        >
                            <Pencil size={16} />
                            Edit
                        </button>
                    </div>
                </div>

                {/* Settings */}
                <div className="px-6 pt-5 pb-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                        Appearance & Privacy
                    </h3>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    <SettingItem icon={<Moon size={20} />} title="Dark Mode" state={darkMode} onClick={() => setDarkMode(!darkMode)} />
                    <SettingItem icon={<Bell size={20} />} title="Notifications" state={notifications} onClick={() => setNotifications(!notifications)} />
                    <SettingItem icon={<Shield size={20} />} title="Show Last Seen" state={lastSeen} onClick={() => setLastSeen(!lastSeen)} />
                </div>

                {/* Logout */}
                <div className="p-6">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] text-red-600 dark:text-red-400 font-medium py-3 rounded-xl transition-all"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>

            <BottomBar />
        </div>
    );
};

const SettingItem = ({ icon, title, state, onClick }) => {
    return (
        <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3 text-zinc-800 dark:text-zinc-200">
                <span className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                    {icon}
                </span>
                <span className="font-medium text-sm">{title}</span>
            </div>

            <button
                onClick={onClick}
                aria-pressed={state}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    state ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
            >
                <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                        state ? "translate-x-6" : "translate-x-0"
                    }`}
                />
            </button>
        </div>
    );
};

export default Setting;
