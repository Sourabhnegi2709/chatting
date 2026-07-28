// src/context/CallContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PhoneIncoming, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthContext";
import { connectSocket } from "../services/socket";

const CallContext = createContext();

export const CallProvider = ({ children }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [incomingCall, setIncomingCall] = useState(null);
    const socketRef = useRef(null);
    const ringtoneAudioRef = useRef(null);

    // True while the user is on the /call page in an active/ringing call.
    // Lets us auto-decline a second incoming call instead of showing a
    // confusing overlay on top of the active call screen.
    const isCallActiveRef = useRef(false);
    const setCallActive = useCallback((active) => {
        isCallActiveRef.current = active;
    }, []);

    const getUserId = (value) => value?.id || value?._id || value;
    const currentUserId = getUserId(user);

    const playRingtone = useCallback(() => {
        if (!ringtoneAudioRef.current) {
            ringtoneAudioRef.current = new Audio("/sounds/ringback.mp3");
            ringtoneAudioRef.current.loop = true;
        }
        ringtoneAudioRef.current.play().catch((e) => console.warn("Audio autoplay blocked:", e));
    }, []);

    const stopRingtone = useCallback(() => {
        if (ringtoneAudioRef.current) {
            ringtoneAudioRef.current.pause();
            ringtoneAudioRef.current.currentTime = 0;
        }
    }, []);

    useEffect(() => {
        if (!user || !currentUserId) return;

        const socket = connectSocket();
        socketRef.current = socket;

        const registerUser = () => {
            socket.emit("register-user", {
                userId: currentUserId,
                name: user.name,
                email: user.email,
            });
        };

        if (socket.connected) registerUser();
        else socket.once("connect", registerUser);

        const handleIncomingCall = ({ callId, caller, offer }) => {
            // Already on a call somewhere else -> auto-decline as busy.
            if (isCallActiveRef.current) {
                socket.emit("reject-call", { callId, reason: "busy" });
                return;
            }
            playRingtone();
            setIncomingCall({ callId, caller, offer });
        };

        const handleCallCancelled = () => {
            stopRingtone();
            setIncomingCall(null);
        };

        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-rejected", handleCallCancelled);
        socket.on("call-ended", handleCallCancelled);

        return () => {
            stopRingtone();
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-rejected", handleCallCancelled);
            socket.off("call-ended", handleCallCancelled);
        };
    }, [user, currentUserId, playRingtone, stopRingtone]);

    const acceptIncomingCall = () => {
        stopRingtone();
        const callData = incomingCall;
        setIncomingCall(null);

        navigate("/call", {
            state: {
                incomingCallData: callData,
                contact: callData?.caller,
            },
        });
    };

    const rejectIncomingCall = () => {
        stopRingtone();
        if (incomingCall?.callId && socketRef.current?.connected) {
            socketRef.current.emit("reject-call", { callId: incomingCall.callId });
        }
        setIncomingCall(null);
    };

    return (
        <CallContext.Provider value={{ socketRef, stopRingtone, setCallActive }}>
            {children}

            <AnimatePresence>
                {incomingCall && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="fixed top-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-[9999] rounded-3xl border border-emerald-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl text-white"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                                <PhoneIncoming size={22} className="animate-bounce" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                                    Incoming Video Call...
                                </p>
                                <p className="text-sm font-bold text-white truncate">
                                    {incomingCall.caller?.name || "Unknown Caller"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={acceptIncomingCall}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-4 py-2.5 font-bold text-white text-xs tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/30"
                            >
                                Accept
                            </button>
                            <button
                                onClick={rejectIncomingCall}
                                className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 px-4 py-2.5 font-bold text-slate-200 text-xs tracking-wider uppercase transition-all border border-slate-700"
                            >
                                <PhoneOff size={16} />
                                Reject
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CallContext.Provider>
    );
};

export const useCall = () => useContext(CallContext);