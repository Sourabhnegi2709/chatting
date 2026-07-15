import React from "react";

const FriendCard = ({ friend }) => {
    return (
        <div className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm hover:bg-zinc-50 cursor-pointer transition">
            <img
                src={friend.avatar}
                alt={friend.name}
                className="w-12 h-12 rounded-full"
            />

            <div className="flex-1">
                <h3 className="font-medium text-zinc-800">
                    {friend.name}
                </h3>
                <p className="text-sm text-zinc-500">
                    {friend.lastMessage}
                </p>
            </div>
        </div>
    );
};

export default FriendCard;