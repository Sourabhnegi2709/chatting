import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

const MessageArea = ({ messages = [] }) => {
    const scrollContainerRef = useRef(null);
    const bottomRef = useRef(null);
    const shouldAutoScrollRef = useRef(true);

    const updateAutoScrollState = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        shouldAutoScrollRef.current = distanceFromBottom < 80;
    };

    useLayoutEffect(() => {
        const container = scrollContainerRef.current;

        if (!container) return;

        if (shouldAutoScrollRef.current) {
            requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
            });
        }
    }, [messages]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        updateAutoScrollState();
        const handleScroll = () => updateAutoScrollState();
        container.addEventListener("scroll", handleScroll, { passive: true });

        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div
            ref={scrollContainerRef}
            className="relative  flex-1 min-h-auto overflow-y-auto overscroll-contain scroll-smooth px-4 py-4 pb-8 chat-area-pattern"
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full opacity-80" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grayPattern" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="rgba(107,114,128,0.08)" />
                            <stop offset="100%" stopColor="rgba(148,163,184,0.12)" />
                        </linearGradient>
                    </defs>
                    <g fill="none" stroke="rgba(75,85,99,0.20)" strokeWidth="1.8">
                        <path d="M62 90c0-10 8.2-18 18.5-18h60c10.3 0 18.5 8.2 18.5 18v38c0 10-8.2 18-18.5 18H90l-28 22v-60Z" />
                        <path d="M152 140c0-7 5.8-12.5 13-12.5h42c7.2 0 13 5.5 13 12.5v28c0 7-5.8 12.5-13 12.5h-24l-22 16v-57Z" />
                        <path d="M398 52c0-9 7.5-16.5 16.5-16.5h60c9 0 16.5 7.5 16.5 16.5v46c0 9-7.5 16.5-16.5 16.5h-28l-32 24V52Z" />
                        <path d="M288 280c0-8 6.5-14.5 14.5-14.5h48c8 0 14.5 6.5 14.5 14.5v32c0 8-6.5 14.5-14.5 14.5h-28l-26 20v-56Z" />
                    </g>
                    <g stroke="rgba(100,116,139,0.16)" strokeWidth="1.4">
                        <path d="M80 144c18-14 42-16 64-6" />
                        <path d="M430 210c-22 16-52 18-76 4" />
                        <path d="M102 402c20-18 50-22 74-10" />
                        <path d="M510 350c-18 14-42 18-62 10" />
                    </g>
                    <g fill="rgba(209,213,219,0.26)" stroke="rgba(100,116,139,0.12)" strokeWidth="1.2">
                        <circle cx="108" cy="492" r="30" />
                        <circle cx="480" cy="150" r="20" />
                        <circle cx="430" cy="510" r="22" />
                    </g>
                    <g stroke="rgba(75,85,99,0.22)" strokeWidth="1.2">
                        <path d="M84 468h32" />
                        <path d="M82 482h38" />
                        <path d="M86 496h26" />
                        <path d="M348 472l16 16" />
                        <path d="M348 488l16-16" />
                        <path d="M536 266l10 10" />
                        <path d="M546 266l-10 10" />
                    </g>
                    <path d="M80 340c35 32 90 24 118-16" stroke="rgba(255,255,255,0.30)" strokeWidth="2" fill="none" />
                    <path d="M400 120c-28 24-72 22-98-6" stroke="rgba(255,255,255,0.24)" strokeWidth="2" fill="none" />
                </svg>
                <motion.div
                    animate={{ x: [0, 12, 0], y: [0, -10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[10%] top-[14%] h-20 w-20 rounded-full border border-white/40 bg-white/20 blur-2xl"
                />
                <motion.div
                    animate={{ x: [0, -10, 0], y: [0, 12, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[16%] right-[14%] h-28 w-28 rounded-full border border-white/40 bg-white/15 blur-3xl"
                />
            </div>

            <div className="relative z-10 min-h-full flex flex-col justify-end">
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
                    <div className="flex flex-col gap-1.5 min-h-full">
                        {messages.map((message) => (
                            <ChatBubble key={message.id} message={message} senderId={message.senderId} />
                        ))}
                        <div ref={bottomRef} className="h-2 mt-1" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageArea;
