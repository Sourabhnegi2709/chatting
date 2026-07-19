import { LogOut, MessageSquarePlus } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../ui/Avatar";
import IconButton from "../ui/IconButton";
import SearchBar from "../ui/SearchBar";
import ChatItem from "./ChatItem";

const Sidebar = ({ contacts, activeContactId, onSelectContact, searchQuery, setSearchQuery }) => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col w-full h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Avatar src={user?.avatar} name={user?.name || "User"} size="md" status="online" />
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-zinc-900 truncate">{user?.name || "User"}</h3>
                        <p className="text-xs text-zinc-500 truncate">{user?.email || "No email"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <IconButton title="New chat" aria-label="New chat">
                        <MessageSquarePlus size={20} />
                    </IconButton>
                    <IconButton onClick={logout} title="Logout" aria-label="Logout" variant="danger">
                        <LogOut size={20} />
                    </IconButton>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                />
                <p className="mt-2 px-1 text-xs text-zinc-400">
                    {contacts.length === 1 ? "1 user" : `${contacts.length} users`}
                </p>
            </div>

            {/* Contact List */}
            <div className="flex-1 overflow-y-auto px-2 pb-2">
                {contacts.length > 0 ? (
                    <div className="space-y-1">
                        {contacts.map((contact, i) => (
                            <motion.div
                                key={contact.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(i * 0.04, 0.4), duration: 0.2 }}
                            >
                                <ChatItem
                                    contact={contact}
                                    isActive={contact.id === activeContactId}
                                    onClick={() => onSelectContact(contact.id)}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                        <p className="text-sm font-medium text-zinc-600 mb-1">No users found</p>
                        <p className="text-xs text-zinc-400">Try a different search or check back later</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
