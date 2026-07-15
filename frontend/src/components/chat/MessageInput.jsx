import { Plus, SendHorizonal, Smile } from 'lucide-react';
import { useState } from 'react';
import IconButton from '../ui/IconButton';

const MessageInput = ({ onSendMessage }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText(''); // Clear the input after sending
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-zinc-200">
            <IconButton><Smile size={22} /></IconButton>
            <IconButton><Plus size={22} /></IconButton>

            <div className="flex-1">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2.5 bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-500"
                />
            </div>

            {text.trim() && (
                <IconButton onClick={handleSend} className="bg-green-500 text-white hover:bg-green-600 ml-1">
                    <SendHorizonal size={20} />
                </IconButton>
            )}
        </div>
    );
};

export default MessageInput;