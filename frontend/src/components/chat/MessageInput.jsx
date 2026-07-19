import { Mic, Plus, SendHorizonal, Smile } from "lucide-react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IconButton from "../ui/IconButton";

const MessageInput = ({ onSendMessage }) => {
    const [text, setText] = useState("");
    const textareaRef = useRef(null);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText("");
            if (textareaRef.current) textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const autoGrow = (e) => {
        setText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const hasText = text.trim().length > 0;

    return (
        <div
            className="flex items-end gap-1.5 px-3 py-2.5 bg-white border-t border-zinc-200"
            style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom, 0px))" }}
        >
            <div className="flex items-center gap-0.5 pb-1">
                <IconButton aria-label="Emoji"><Smile size={22} /></IconButton>
                <IconButton aria-label="Attach"><Plus size={22} /></IconButton>
            </div>

            <div className="flex-1 flex items-end bg-zinc-100 rounded-2xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-shadow">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={autoGrow}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 resize-none bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-500 max-h-[120px] py-1 leading-relaxed"
                />
            </div>

            <div className="pb-1">
                <AnimatePresence mode="wait" initial={false}>
                    {hasText ? (
                        <motion.div
                            key="send"
                            initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <IconButton
                                onClick={handleSend}
                                variant="solid"
                                aria-label="Send message"
                            >
                                <SendHorizonal size={20} />
                            </IconButton>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mic"
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                        >
                            <IconButton aria-label="Voice message">
                                <Mic size={22} />
                            </IconButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MessageInput;
