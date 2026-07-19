import { Video } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const VideoMeet = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur"
            >
                <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mb-5">
                    <Video size={26} className="text-emerald-400" />
                </div>
                <h1 className="text-2xl font-semibold">Video calling</h1>
                <p className="mt-3 text-sm text-zinc-400">
                    Open a chat and start a video call with any online contact.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-6 rounded-full bg-emerald-500 px-5 py-2.5 font-medium text-white transition-all hover:bg-emerald-600 active:scale-95"
                >
                    Back to chats
                </button>
            </motion.div>
        </div>
    );
};

export default VideoMeet;
