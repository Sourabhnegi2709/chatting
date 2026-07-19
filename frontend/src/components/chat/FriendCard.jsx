import React from "react";
import Avatar from "../ui/Avatar";

const FriendCard = ({ friend }) => {
    return (
        <button className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-150 text-left">
            <Avatar src={friend.avatar} name={friend.name} size="lg" status={friend.status} />

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 text-[15px] truncate">{friend.name}</h3>
                <p className="text-[13px] text-zinc-500 truncate mt-0.5">{friend.lastMessage}</p>
            </div>
        </button>
    );
};

export default FriendCard;
