import { motion } from "framer-motion";
import Avatar from "../ui/Avatar";

const FriendCard = ({ friend }) => {
    return (
        <motion.button
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="shimmer-sweep glass-surface glass-grain w-full flex items-center gap-3 p-3 rounded-2xl text-left shadow-[0_14px_34px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_20px_44px_rgba(16,185,129,0.18)]"
        >
            <Avatar src={friend.avatar} name={friend.name} size="lg" status={friend.status} />

            <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-zinc-900 text-[15px] truncate">{friend.name}</h3>
                <p className="text-[13px] text-zinc-500 truncate mt-0.5">{friend.lastMessage}</p>
            </div>
        </motion.button>
    );
};

export default FriendCard;
