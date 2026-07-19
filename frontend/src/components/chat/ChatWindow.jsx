import { ArrowLeft, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";

const ChatWindow = ({ activeContact, onSendMessage, onBack }) => {
    if (!activeContact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-white text-center px-6">
                <div className="w-20 h-20 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                    <MessageSquare size={36} className="text-zinc-300" strokeWidth={1.5} />
                </div>
                <h1 className="text-xl font-medium text-zinc-400 mt-2">No chat selected</h1>
                <p className="text-zinc-400 text-sm max-w-xs">
                    Select a contact from the sidebar to start messaging
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-zinc-200">
                <div className="flex items-center px-3 md:px-6">
                    <button
                        onClick={onBack}
                        aria-label="Back to chats"
                        className="md:hidden mr-1 w-10 h-10 flex items-center justify-center hover:bg-zinc-100 rounded-full transition-colors active:scale-90"
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                    className="flex-1 overflow-hidden flex flex-col"
                >
                    <div className="flex-1 overflow-y-auto">
                        <MessageArea messages={activeContact?.messages || []} />
                    </div>
                    <MessageInput onSendMessage={onSendMessage} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default ChatWindow;
