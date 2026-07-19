import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const ChatBubble = ({ message, senderId }) => {
    const isMe = senderId === "me";

    return (
        <motion.div
            initial={{ opacity: 0, y: 12, x: isMe ? 16 : -16 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={cn("flex mb-1", isMe ? "justify-end" : "justify-start")}
        >
            <div className={cn("flex flex-col max-w-[78%]", isMe ? "items-end" : "items-start")}>
                <div
                    className={cn(
                        "px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap break-words",
                        isMe
                            ? "bg-emerald-500 text-white rounded-br-md"
                            : "bg-zinc-100 text-zinc-900 rounded-bl-md"
                    )}
                >
                    {message.text}
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 px-1">
                    {message.timestamp}
                </span>
            </div>
        </motion.div>
    );
};

export default ChatBubble;
