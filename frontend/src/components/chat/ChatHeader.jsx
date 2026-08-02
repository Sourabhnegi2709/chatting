import { Video } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Avatar from "../ui/Avatar";

const ChatHeader = ({ contact }) => {
    const navigate = useNavigate();

    if (!contact) return null;

    const statusLabel = contact.status === "online" ? "Active now" : "Last seen recently";

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between gap-3 py-3 px-1"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-emerald-400/50 to-violet-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                    {contact.status === "online" && (
                        <span className="animate-glow-pulse motion-reduce:animate-none absolute -inset-1 -z-10 rounded-2xl bg-emerald-400/30 blur-md" />
                    )}
                    <Avatar src={contact.avatar} name={contact.name} status={contact.status} />
                </div>
                <div className="min-w-0">
                    <h2 className="font-display text-[16px] font-semibold text-zinc-900 truncate">{contact.name}</h2>
                    <p className={`font-glass-mono text-[11px] truncate ${contact.status === "online" ? "text-emerald-600" : "text-zinc-500"}`}>
                        {statusLabel}
                    </p>
                </div>
            </div>

            <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => navigate("/call", { state: { contact } })}
                aria-label="Start video call"
                className="aurora-ring shimmer-sweep flex items-center gap-2 rounded-full border border-emerald-500/20 bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 sm:px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition-shadow duration-200 hover:shadow-[0_18px_38px_rgba(16,185,129,0.32)]"
            >
                <Video size={17} />
                <span className="hidden sm:inline">Video</span>
            </motion.button>
        </motion.div>
    );
};

export default ChatHeader;
