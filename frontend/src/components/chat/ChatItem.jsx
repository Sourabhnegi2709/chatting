import { cn } from "../../utils/cn";
import Avatar from "../ui/Avatar";

const ChatItem = ({ contact, isActive, onClick }) => {
    const lastMessage = contact.messages?.at(-1);
    const displayText = contact.lastMessage || lastMessage?.text || "No messages yet";

    return (
        <div
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-3 cursor-pointer rounded-lg transition-colors",
                isActive ? "bg-blue-50 border border-blue-200" : "hover:bg-zinc-100"
            )}
        >
            <div className="relative flex-shrink-0">
                <Avatar
                    src={contact.avatar}
                    name={contact.name}
                    size="md"
                    status={contact.status}
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-900 truncate">{contact.name}</h3>
                    {contact.lastMessageTime && (
                        <span className="text-xs text-zinc-500 whitespace-nowrap flex-shrink-0">
                            {new Date(contact.lastMessageTime).toLocaleTimeString([], { 
                                hour: "2-digit", 
                                minute: "2-digit" 
                            })}
                        </span>
                    )}
                </div>
                <p className="text-xs text-zinc-500 truncate">{displayText}</p>
            </div>

            {contact.unreadCount > 0 && (
                <div className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                    {contact.unreadCount > 9 ? "9+" : contact.unreadCount}
                </div>
            )}
        </div>
    );
};

export default ChatItem;