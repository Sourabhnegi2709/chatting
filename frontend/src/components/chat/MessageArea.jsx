import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

const MessageArea = ({ messages = [] }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="relative flex-1 min-h-0 overflow-y-auto px-4 py-4">
            <div
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.12) 0, transparent 22%), radial-gradient(circle at 80% 10%, rgba(139,124,246,0.16) 0, transparent 24%), radial-gradient(circle at 50% 100%, rgba(244,114,182,0.10) 0, transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.88))",
                    backgroundColor: "#f8fafc",
                }}
            >
                <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full opacity-55" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(16,185,129,0.18)" />
                            <stop offset="100%" stopColor="rgba(139,124,246,0.22)" />
                        </linearGradient>
                    </defs>
                    <path d="M80 140C185 60, 300 78, 360 166C420 254, 470 320, 520 400" stroke="url(#meshGradient)" strokeWidth="2.2" fill="none" />
                    <path d="M70 360C150 300, 240 290, 310 340C380 390, 460 430, 540 360" stroke="url(#meshGradient)" strokeWidth="2.2" fill="none" />
                    <circle cx="200" cy="160" r="70" fill="rgba(255,255,255,0.45)" />
                    <circle cx="430" cy="370" r="120" fill="rgba(255,255,255,0.30)" />
                </svg>
                <motion.div
                    animate={{ x: [0, 18, 0], y: [0, -12, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[8%] top-[12%] h-28 w-28 rounded-full border border-white/60 bg-white/30 blur-2xl"
                />
                <motion.div
                    animate={{ x: [0, -12, 0], y: [0, 16, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[14%] right-[10%] h-36 w-36 rounded-full border border-white/60 bg-white/20 blur-3xl"
                />
            </div>

            <div className="relative z-10">
                {messages.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className="h-full flex flex-col items-center justify-center text-center gap-2 text-zinc-400"
                    >
                        <p className="font-display text-sm">No messages yet</p>
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
        </div>
    );
};

export default MessageArea;
