import { motion } from "framer-motion";
import { cn } from "../../utils/cn";
import Avatar from "../ui/Avatar";

const ChatItem = ({ contact, isActive, onClick }) => {
    const lastMessage = contact.messages?.at(-1);
    const displayText = contact.lastMessage || lastMessage?.text || "No messages yet";

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={cn(
                "glass-grain relative w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-colors duration-200",
                isActive ? "glass-surface shadow-[0_10px_28px_rgba(16,185,129,0.12)]" : "hover:bg-white/50"
            )}
        >
            {/* Active accent bar, spring-animated instead of just toggled */}
            <motion.span
                initial={false}
                animate={{ height: isActive ? 32 : 0, opacity: isActive ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-violet-500"
            />

            <div className="relative">
                {isActive && <span className="animate-glow-pulse motion-reduce:animate-none absolute -inset-1 -z-10 rounded-full bg-emerald-400/25 blur-md" />}
                <Avatar src={contact.avatar} name={contact.name} size="md" status={contact.status} />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-[15px] font-semibold text-zinc-900 truncate">
                        {contact.name}
                    </h3>
                    {contact.lastMessageTime && (
                        <span
                            className={cn(
                                "font-glass-mono text-[10.5px] whitespace-nowrap flex-shrink-0",
                                isActive ? "text-emerald-600 font-medium" : "text-zinc-400"
                            )}
                        >
                            {new Date(contact.lastMessageTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    )}
                </div>
                <p className="text-[13px] text-zinc-500 truncate mt-0.5">{displayText}</p>
            </div>

            {contact.unreadCount > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white text-[11px] font-semibold rounded-full flex-shrink-0 shadow-[0_4px_10px_rgba(16,185,129,0.4)]"
                >
                    {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
                </motion.div>
            )}
        </motion.button>
    );
};

export default ChatItem;
