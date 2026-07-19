import { Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";

const ChatHeader = ({ contact }) => {
    const navigate = useNavigate();

    if (!contact) return null;

    const statusLabel = contact.status === "online" ? "Active now" : "Last seen recently";

    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar src={contact.avatar} name={contact.name} status={contact.status} />
                <div className="min-w-0">
                    <h2 className="text-[15px] font-semibold text-zinc-900 truncate">{contact.name}</h2>
                    <p className={`text-xs truncate ${contact.status === "online" ? "text-emerald-600" : "text-zinc-500"}`}>
                        {statusLabel}
                    </p>
                </div>
            </div>

            <button
                onClick={() => navigate("/call", { state: { contact } })}
                aria-label="Start video call"
                className="flex items-center gap-2 rounded-full bg-emerald-500 px-3 sm:px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 hover:shadow-md active:scale-95"
            >
                <Video size={17} />
                <span className="hidden sm:inline">Video</span>
            </button>
        </div>
    );
};

export default ChatHeader;
