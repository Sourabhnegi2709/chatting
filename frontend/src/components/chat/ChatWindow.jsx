import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MessageSquare } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";

const ChatWindow = ({ activeContact, onSendMessage, onBack }) => {
    if (!activeContact) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 bg-white text-center px-6"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="glass-surface glass-grain w-20 h-20 rounded-3xl flex items-center justify-center shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
                >
                    <MessageSquare size={36} className="text-emerald-500/70" strokeWidth={1.5} />
                </motion.div>
                <h1 className="font-display text-xl font-medium text-zinc-400 mt-2">No chat selected</h1>
                <p className="text-zinc-400 text-sm max-w-xs">
                    Select a contact from the sidebar to start messaging
                </p>
            </motion.div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent">
            <div className="glass-surface glass-grain sticky top-0 z-10">
                <div className="flex items-center px-3 md:px-6">
                    <button
                        onClick={onBack}
                        aria-label="Back to chats"
                        className="md:hidden mr-1 w-10 h-10 flex items-center justify-center hover:bg-white/60 rounded-full transition-colors active:scale-90"
                    >
                        <ArrowLeft size={22} className="text-zinc-600" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <ChatHeader contact={activeContact} />
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeContact.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 min-h-0 overflow-y-auto flex flex-col"
                >
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <MessageArea messages={activeContact?.messages || []} />
                    </div>
                    <div className="shrink-0">
                        <MessageInput onSendMessage={onSendMessage} />
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ChatWindow;
