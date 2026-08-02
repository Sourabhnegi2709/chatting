import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const ChatBubble = ({ message, senderId }) => {
    const isMe = senderId === "me";

    return (
        <motion.div
            initial={{ opacity: 0, y: 14, x: isMe ? 18 : -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 340, damping: 28, mass: 0.7 }}
            className={cn("flex mb-2", isMe ? "justify-end" : "justify-start")}
        >
            <div className={cn("flex flex-col max-w-[82%] sm:max-w-[72%]", isMe ? "items-end" : "items-start")}>
                <motion.div
                    initial={{ opacity: 0.85, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        "glass-grain relative overflow-hidden px-4 py-2.75 rounded-[1.25rem] text-sm leading-relaxed whitespace-pre-wrap break-words transition-shadow duration-300",
                        isMe
                            ? "aurora-ring shimmer-sweep bg-gradient-to-br from-emerald-500/95 via-emerald-500/85 to-emerald-600/90 text-white rounded-br-md border border-white/30 shadow-[0_20px_45px_rgba(16,185,129,0.28)]"
                            : "shimmer-sweep glass-surface text-zinc-900 rounded-bl-md shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
                    )}
                >
                    {/* Ambient color wash behind the glass, deepens the frosted feel */}
                    <div className={cn("absolute inset-0 -z-10 blur-2xl opacity-70", isMe ? "bg-emerald-300/35" : "bg-slate-200/40")} />
                    <div className="relative z-10">{message.text}</div>
                </motion.div>
                <span className={cn("font-glass-mono text-[10.5px] mt-1 px-1 tracking-wide", isMe ? "text-emerald-600/70" : "text-zinc-400")}>
                    {message.timestamp}
                </span>
            </div>
        </motion.div>
    );
};

export default ChatBubble;
