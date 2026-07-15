import { cn } from '../../utils/cn';

const ChatBubble = ({ message, senderId }) => {
    const isMe = senderId === 'me';

    return (
        <div className={cn("flex mb-1.5", isMe ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[82%] px-4 py-2 rounded-2xl shadow-sm flex items-end gap-2",
                    isMe
                        ? "bg-emerald-500 text-white rounded-br-sm"
                        : "bg-zinc-100 text-zinc-900 rounded-bl-sm"
                )}
            >
                <p className="text-sm text-zinc-900 whitespace-pre-wrap">{message.text}</p>
                <span className="text-[10px] text-zinc-500 whitespace-nowrap mb-[-2px]">{message.timestamp}</span>
            </div>
        </div>
    );
};

export default ChatBubble;