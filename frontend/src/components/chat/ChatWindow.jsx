import { ArrowLeft, MessageSquare } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";

const ChatWindow = ({ activeContact, onSendMessage, onBack }) => {
    // Empty state when no contact is selected
    if (!activeContact) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white text-center px-6">
                <MessageSquare
                    size={80}
                    className="text-zinc-400"
                    strokeWidth={1}
                />
                <h1 className="text-2xl font-light text-zinc-300 mt-4">
                    No chat selected
                </h1>
                <p className="text-zinc-500 max-w-xs">
                    Select a contact from the sidebar to start messaging
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white">
            {/* Header with Back Button for Mobile */}
            <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 shadow-sm">
                <div className="flex items-center px-4 py-3 md:px-6">
                    {/* Back Button - Visible only on mobile */}
                    <button
                        onClick={onBack}
                        className="md:hidden mr-3 p-2 hover:bg-zinc-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={24} className="text-zinc-600" />
                    </button>

                    {/* Chat Header */}
                    <div className="flex-1">
                        <ChatHeader contact={activeContact} />
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <MessageArea
                    messages={activeContact?.messages || []}
                />
            </div>

            {/* Message Input */}
            <div className="border-t border-zinc-200 bg-white">
                <MessageInput
                    onSendMessage={onSendMessage}
                />
            </div>
        </div>
    );
};

export default ChatWindow;