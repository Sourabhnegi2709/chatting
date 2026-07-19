import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ChatBubble from "./ChatBubble";

const MessageArea = ({ messages = [] }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div
            className="flex-1 overflow-y-auto px-4 py-4"
            style={{
                backgroundImage: "radial-gradient(circle, rgb(228 228 231) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
                backgroundColor: "#fff",
            }}
        >
            {messages.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-2 text-zinc-400"
                >
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs">Say hello 👋</p>
                </motion.div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {messages.map((message) => (
                        <ChatBubble key={message.id} message={message} senderId={message.senderId} />
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
};

export default MessageArea;
