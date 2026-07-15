
import { useNavigate } from "react-router-dom";

const VideoMeet = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
            <div className="max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur">
                <h1 className="text-2xl font-semibold">Video calling</h1>
                <p className="mt-3 text-sm text-zinc-300">Open a chat and start a video call with any online contact.</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-6 rounded-full bg-emerald-500 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-600"
                >
                    Back to chats
                </button>
            </div>
        </div>
    );
};

export default VideoMeet;
