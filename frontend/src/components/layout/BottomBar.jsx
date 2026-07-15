import React from "react";
import { MessageCircle, Video, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const BottomBar = () => {
    return (
        <div className="w-full h-16 bg-white border-t border-zinc-200 fixed bottom-0 left-0 flex items-center justify-around">
            <button className="flex flex-col items-center text-green-500">
                <MessageCircle size={22} />
                <Link to="/" className="flex flex-col items-center text-zinc-600">
                <span className="text-xs">Chats</span>
                </Link>
            </button>

            <Link to="/call" className="flex flex-col items-center text-zinc-600">
                <Video size={22} />
                <span className="text-xs">Calls</span>
            </Link>

            <Link to="/settings" className="flex flex-col items-center text-zinc-600">
                <Settings size={22} />
                <span className="text-xs">Settings</span>
            </Link>
        </div>
    );
};

export default BottomBar;