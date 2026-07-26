// src/pages/Call.jsx
import {
    ArrowLeft,
    Mic,
    MicOff,
    PhoneOff,
    Video,
    VideoOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCall } from "../context/CallContext";

const STUN_SERVERS = [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
    { urls: ["stun:stun2.l.google.com:19302"] },
];

const buildCallId = (id1, id2) => [id1, id2].sort().join("_");

const Call = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { socketRef, stopRingtone } = useCall();

    const contact = location.state?.contact;
    const acceptedIncomingCall = location.state?.incomingCallData;

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStatus, setCallStatus] = useState("Initializing...");
    const [error, setError] = useState(null);

    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callStartedRef = useRef(false);
    const currentCallIdRef = useRef(null);

    // Audio Ref for Outgoing Ringback Sound
    const ringbackAudioRef = useRef(null);

    const getUserId = (value) => value?.id || value?._id || value;
    const currentUserId = getUserId(user);
    const contactUserId = getUserId(contact);

    const playRingback = () => {
        if (!ringbackAudioRef.current) {
            ringbackAudioRef.current = new Audio("/sounds/ringtone.mp3");
            ringbackAudioRef.current.loop = true;
        }
        ringbackAudioRef.current.play().catch((e) => console.warn("Audio autoplay blocked:", e));
    };

    const stopRingback = useCallback(() => {
        if (ringbackAudioRef.current) {
            ringbackAudioRef.current.pause();
            ringbackAudioRef.current.currentTime = 0;
        }
    }, []);

    const emitToSocket = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.error(`Socket not connected for event: ${event}`);
        }
    }, [socketRef]);

    const getMediaStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: true,
            });
            setLocalStream(stream);
            setError(null);
            return stream;
        } catch (err) {
            setError("Camera or microphone access denied. Check your browser permissions.");
            setCallStatus("Media devices unavailable");
            throw err;
        }
    }, []);

    const createPeerConnection = useCallback(async () => {
        let stream = localStream;
        if (!stream) {
            stream = await getMediaStream();
        }

        const peerConnection = new RTCPeerConnection({ iceServers: STUN_SERVERS });

        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
            if (event.streams?.[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            if (state === "connected" || state === "completed") {
                stopRingback();
                stopRingtone();
                setCallStatus("Connected");
            } else if (state === "failed") {
                stopRingback();
                stopRingtone();
                setCallStatus("Connection failed");
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                emitToSocket("ice-candidate", {
                    callId: currentCallIdRef.current,
                    recipientUserId: contactUserId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnectionRef.current = peerConnection;
        return peerConnection;
    }, [localStream, getMediaStream, contactUserId, emitToSocket, stopRingback, stopRingtone, socketRef]);

    const cleanupCall = useCallback(() => {
        stopRingback();
        stopRingtone();
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach((track) => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        callStartedRef.current = false;
        currentCallIdRef.current = null;
    }, [localStream, stopRingback, stopRingtone]);

    // Socket Event Listeners for Active Call Statuses
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleCallAccepted = async ({ answer }) => {
            stopRingback();
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    setCallStatus("Connecting...");
                }
            } catch (err) {
                console.error("Error setting remote description:", err);
            }
        };

        const handleCallRejected = () => {
            stopRingback();
            setCallStatus("Call declined");
            cleanupCall();
            setTimeout(() => navigate(-1), 1500);
        };

        const handleCallEnded = () => {
            stopRingback();
            setCallStatus("Call ended");
            cleanupCall();
            setTimeout(() => navigate(-1), 1000);
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (peerConnectionRef.current && candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            }
        };

        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", handleCallEnded);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", handleCallEnded);
            socket.off("ice-candidate", handleIceCandidate);
        };
    }, [socketRef, stopRingback, cleanupCall, navigate]);

    // Initialize Call Flow
    useEffect(() => {
        if (callStartedRef.current) return;

        // SCENARIO 1: Answering an incoming call from global context modal
        if (acceptedIncomingCall) {
            const handleAnswer = async () => {
                callStartedRef.current = true;
                setCallStatus("Connecting...");

                const peerConnection = await createPeerConnection();
                await peerConnection.setRemoteDescription(new RTCSessionDescription(acceptedIncomingCall.offer));

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                emitToSocket("accept-call", {
                    callId: acceptedIncomingCall.callId,
                    answer,
                });

                currentCallIdRef.current = acceptedIncomingCall.callId;
            };

            handleAnswer();
            return;
        }

        // SCENARIO 2: Starting an outgoing call to a contact
        if (contact && contactUserId && currentUserId) {
            const initOutgoingCall = async () => {
                try {
                    callStartedRef.current = true;
                    setCallStatus("Initializing media...");

                    await getMediaStream();
                    const peerConnection = await createPeerConnection();

                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);

                    const callId = buildCallId(currentUserId, contactUserId);
                    currentCallIdRef.current = callId;

                    emitToSocket("start-call", {
                        recipientUserId: contactUserId,
                        caller: { id: currentUserId, name: user.name },
                        offer,
                    });

                    playRingback();
                    setCallStatus(`Calling ${contact.name}...`);
                } catch (err) {
                    console.error("Failed to start call:", err);
                    setCallStatus("Failed to start call");
                }
            };

            initOutgoingCall();
        }
    }, [acceptedIncomingCall, contact, contactUserId, currentUserId, user, getMediaStream, createPeerConnection, emitToSocket]);

    const endCall = () => {
        cleanupCall();
        if (currentCallIdRef.current) {
            emitToSocket("end-call", {
                callId: currentCallIdRef.current,
                recipientUserId: contactUserId,
            });
        }
        navigate(-1);
    };

    const toggleMute = () => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = isMuted;
        });
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !isVideoOn;
        });
        setIsVideoOn(!isVideoOn);
    };

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="relative h-[100dvh] w-full bg-slate-950 text-white flex flex-col justify-between overflow-hidden font-sans">
            {/* Top Navigation Bar */}
            <div className="relative z-20 flex items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-b from-slate-950/80 to-transparent">
                <button
                    onClick={endCall}
                    aria-label="Back"
                    className="flex items-center justify-center rounded-full bg-slate-800/80 text-white p-3 hover:bg-slate-700 active:scale-95 transition-all shadow-md"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700/60 px-4 py-1.5 shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h1 className="text-xs md:text-sm font-semibold tracking-wide text-slate-200">
                        {callStatus}
                    </h1>
                </div>

                <div className="w-10" />
            </div>

            {error && (
                <div className="relative z-20 mx-4 my-2 rounded-2xl bg-red-600/90 border border-red-400/40 px-4 py-3 text-xs md:text-sm font-medium text-white shadow-xl text-center">
                    {error}
                </div>
            )}

            {/* Main Video View */}
            <div className="relative flex-1 px-2 md:px-6 py-2 overflow-hidden flex items-center justify-center">
                <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
                    {remoteStream ? (
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
                            <div className="relative flex h-28 w-28 items-center justify-center">
                                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700 text-3xl font-bold text-slate-100 shadow-2xl">
                                    {contact?.name?.[0]?.toUpperCase() || "C"}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                    {contact?.name || "In Call..."}
                                </h2>
                                <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">
                                    {callStatus}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Local Camera Stream */}
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 h-36 w-28 md:h-48 md:w-36 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-2xl z-10 transition-all">
                        {localStream && isVideoOn ? (
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="h-full w-full object-cover scale-x-[-1]"
                            />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-slate-400">
                                <VideoOff size={20} className="mb-1" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Off</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div
                className="relative z-20 w-full pt-2 pb-6 px-4 flex justify-center bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"
                style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}
            >
                <div className="flex items-center justify-center gap-4 md:gap-6 rounded-full bg-slate-900/90 border border-slate-700/80 px-6 py-3.5 shadow-2xl backdrop-blur-xl">
                    <button
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div
                            className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full transition-all active:scale-90 shadow-md ${
                                isMuted
                                    ? "bg-red-600 text-white shadow-red-600/30"
                                    : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
                            }`}
                        >
                            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200">
                            {isMuted ? "Unmute" : "Mute"}
                        </span>
                    </button>

                    <button
                        onClick={toggleVideo}
                        aria-label={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div
                            className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full transition-all active:scale-90 shadow-md ${
                                !isVideoOn
                                    ? "bg-red-600 text-white shadow-red-600/30"
                                    : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"
                            }`}
                        >
                            {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200">
                            {isVideoOn ? "Cam Off" : "Cam On"}
                        </span>
                    </button>

                    <button
                        onClick={endCall}
                        aria-label="End Call"
                        className="flex flex-col items-center gap-1 group"
                    >
                        <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white transition-all shadow-lg shadow-red-600/40">
                            <PhoneOff size={22} />
                        </div>
                        <span className="text-[10px] font-semibold text-red-400 group-hover:text-red-300">
                            End
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Call;