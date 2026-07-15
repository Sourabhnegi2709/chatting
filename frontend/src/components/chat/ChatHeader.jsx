import { Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";

const ChatHeader = ({ contact }) => {
    const navigate = useNavigate();

    if (!contact) return null;

    return (
        <div className="flex items-center justify-between gap-3 p-4 border-b bg-white">
            <div className="flex items-center gap-3">
                <Avatar
                    src={contact.avatar}
                    name={contact.name}
                    status={contact.status}
                />
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900">{contact.name}</h2>
                    <p className="text-xs text-zinc-500">{contact.status}</p>
                </div>
            </div>

            <button
                onClick={() => navigate('/call', { state: { contact } })}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98]"
            >
                <Video size={16} />
                Video
            </button>
        </div>
    );
};

export default ChatHeader;

