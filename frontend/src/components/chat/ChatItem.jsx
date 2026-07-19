import { cn } from "../../utils/cn";
import Avatar from "../ui/Avatar";

const ChatItem = ({ contact, isActive, onClick }) => {
    const lastMessage = contact.messages?.at(-1);
    const displayText = contact.lastMessage || lastMessage?.text || "No messages yet";

    return (
        <button
            onClick={onClick}
            className={cn(
                "relative w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-150 text-left",
                "active:scale-[0.98]",
                isActive ? "bg-emerald-50" : "hover:bg-zinc-100"
            )}
        >
            {/* Active accent bar */}
            <span
                className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-emerald-500 transition-all duration-200",
                    isActive ? "h-8 opacity-100" : "h-0 opacity-0"
                )}
            />

            <Avatar src={contact.avatar} name={contact.name} size="md" status={contact.status} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-zinc-900 truncate">
                        {contact.name}
                    </h3>
                    {contact.lastMessageTime && (
                        <span
                            className={cn(
                                "text-[11px] whitespace-nowrap flex-shrink-0",
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
                <div className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-emerald-500 text-white text-[11px] font-semibold rounded-full flex-shrink-0">
                    {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
                </div>
            )}
        </button>
    );
};

export default ChatItem;
