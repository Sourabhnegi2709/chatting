import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

const MessageArea = ({ messages = [] }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 relative">
            <div className="relative z-10 flex flex-col gap-1.5">
                {messages.map((message) => (
                    <ChatBubble
                        key={message.id}
                        message={message}
                        senderId={message.senderId}
                    />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default MessageArea;