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

const RTC_OPTIONS = {
    iceServers: STUN_SERVERS,
    sdpSemantics: "unified-plan",
};

const buildCallId = (id1, id2) => [id1, id2].sort().join("_");

const Call = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { socketRef, stopRingtone, setCallActive, showCallToast } = useCall();

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

    // Mirrors localStream in a ref so cleanup-on-unmount always sees the
    // latest stream, even though refs (unlike state) don't trigger re-renders.
    const localStreamRef = useRef(null);

    // Buffer for ICE candidates that arrive before remoteDescription is set
    const pendingCandidatesRef = useRef([]);

    const ringbackAudioRef = useRef(null);

    const getUserId = (value) => value?.id || value?._id || value;
    const currentUserId = getUserId(user);
    const contactUserId = getUserId(contact);

    const playRingback = () => {
        if (!ringbackAudioRef.current) {
            const audio = new Audio("/sounds/ringtone.mp3");
            audio.loop = true;
            // Fall back to the shared ringtone file if ringback.mp3 isn't present
            audio.addEventListener(
                "error",
                () => {
                    audio.src = "/sounds/ringtone.mp3";
                    audio.play().catch((e) => console.warn("Audio autoplay blocked:", e));
                },
                { once: true }
            );
            ringbackAudioRef.current = audio;
        }
        ringbackAudioRef.current.play().catch((e) => console.warn("Audio autoplay blocked:", e));
    };

    const stopRingback = useCallback(() => {
        if (ringbackAudioRef.current) {
            ringbackAudioRef.current.pause();
            ringbackAudioRef.current.currentTime = 0;
            ringbackAudioRef.current = null;
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
            localStreamRef.current = stream;
            setLocalStream(stream);
            setError(null);
            return stream;
        } catch (err) {
            setError("Camera or microphone access denied. Check your browser permissions.");
            setCallStatus("Media devices unavailable");
            throw err;
        }
    }, []);

    // Accepts an explicit stream so we NEVER re-request getUserMedia due to
    // React state not having applied yet (this was firing getUserMedia twice).
    const createPeerConnection = useCallback(async (mediaStream) => {
        const stream = mediaStream || localStream || (await getMediaStream());

        const peerConnection = new RTCPeerConnection(RTC_OPTIONS);

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

    const flushPendingCandidates = useCallback(async () => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        const queued = pendingCandidatesRef.current;
        pendingCandidatesRef.current = [];
        for (const candidate of queued) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding queued ICE candidate:", err);
            }
        }
    }, []);

    const cleanupCall = useCallback(() => {
        stopRingback();
        stopRingtone();
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
            localStreamRef.current = null;
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        pendingCandidatesRef.current = [];
        callStartedRef.current = false;
        currentCallIdRef.current = null;
    }, [stopRingtone, stopRingback]);

    // Mark this page as "in a call" for CallContext (busy handling), and make
    // sure everything is released if the component unmounts any other way
    // than the End Call button (browser back, closing the tab in-app, etc).
    useEffect(() => {
        setCallActive(true);
        return () => {
            setCallActive(false);
            if (currentCallIdRef.current) {
                emitToSocket("end-call", {
                    callId: currentCallIdRef.current,
                    recipientUserId: contactUserId,
                });
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((t) => t.stop());
                localStreamRef.current = null;
            }
            stopRingback();
            stopRingtone();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Socket Event Listeners for Active Call Statuses
    useEffect(() => {
        const socket = socketRef.current;
        if (!socket) return;

        const handleCallAccepted = async ({ answer }) => {
            stopRingback();
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                    await flushPendingCandidates();
                    setCallStatus("Connecting...");
                    showCallToast("Connected");
                }
            } catch (err) {
                console.error("Error setting remote description:", err);
            }
        };

        const handleCallRejected = ({ callId, reason } = {}) => {
            if (currentCallIdRef.current && callId && callId !== currentCallIdRef.current) {
                return;
            }
            stopRingback();
            setCallStatus(reason === "busy" ? "User is busy" : "Call declined");
            showCallToast(reason === "busy" ? "User is busy" : "Call declined");
            cleanupCall();
            setTimeout(() => navigate(-1), 1500);
        };

        const handleCallEnded = ({ callId } = {}) => {
            if (currentCallIdRef.current && callId && callId !== currentCallIdRef.current) {
                return;
            }
            stopRingback();
            setCallStatus("Call ended");
            showCallToast("Call ended");
            cleanupCall();
            setTimeout(() => navigate(-1), 1000);
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (!candidate) return;
            const pc = peerConnectionRef.current;
            if (!pc || !pc.remoteDescription || !pc.remoteDescription.type) {
                pendingCandidatesRef.current.push(candidate);
                return;
            }
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Error adding ICE candidate:", err);
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
    }, [socketRef, stopRingback, cleanupCall, navigate, flushPendingCandidates, showCallToast]);

    // Initialize Call Flow
    useEffect(() => {
        if (callStartedRef.current) return;

        // SCENARIO 1: Answering an incoming call from global context modal
        if (acceptedIncomingCall) {
            const handleAnswer = async () => {
                callStartedRef.current = true;
                setCallStatus("Connecting...");

                try {
                    const stream = await getMediaStream();
                    const peerConnection = await createPeerConnection(stream);

                    await peerConnection.setRemoteDescription(new RTCSessionDescription(acceptedIncomingCall.offer));
                    await flushPendingCandidates();

                    const answer = await peerConnection.createAnswer();
                    await peerConnection.setLocalDescription(answer);

                    currentCallIdRef.current = acceptedIncomingCall.callId;

                    emitToSocket("accept-call", {
                        callId: acceptedIncomingCall.callId,
                        answer,
                    });
                } catch (err) {
                    console.error("Failed to answer call:", err);
                    setCallStatus("Failed to answer call");
                }
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

                    const stream = await getMediaStream();
                    const peerConnection = await createPeerConnection(stream);

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
    }, [acceptedIncomingCall, contact, contactUserId, currentUserId, user, getMediaStream, createPeerConnection, emitToSocket, flushPendingCandidates]);

    const endCall = () => {
        // Capture BEFORE cleanup — cleanupCall() clears currentCallIdRef to null.
        const callId = currentCallIdRef.current;
        const recipientUserId = contactUserId;

        cleanupCall();

        if (callId) {
            emitToSocket("end-call", { callId, recipientUserId });
        }
        navigate(-1);
    };

    const toggleMute = () => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setIsMuted((prev) => !prev);
    };

    const toggleVideo = () => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach((track) => {
            track.enabled = !track.enabled;
        });
        setIsVideoOn((prev) => !prev);
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
            <div className="relative z-20 flex items-center justify-between px-4 md:px-8 py-4 bg-gradient-to-b from-slate-950/80 to-transparent">
                <button onClick={endCall} aria-label="Back" className="flex items-center justify-center rounded-full bg-slate-800/80 text-white p-3 hover:bg-slate-700 active:scale-95 transition-all shadow-md">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700/60 px-4 py-1.5 shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h1 className="text-xs md:text-sm font-semibold tracking-wide text-slate-200">{callStatus}</h1>
                </div>
                <div className="w-10" />
            </div>

            {error && (
                <div className="relative z-20 mx-4 my-2 rounded-2xl bg-red-600/90 border border-red-400/40 px-4 py-3 text-xs md:text-sm font-medium text-white shadow-xl text-center">
                    {error}
                </div>
            )}

            <div className="relative flex-1 px-2 md:px-6 py-2 overflow-hidden flex items-center justify-center">
                <div className="relative h-full w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
                    {remoteStream ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-4 text-center p-6">
                            <div className="relative flex h-28 w-28 items-center justify-center">
                                <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700 text-3xl font-bold text-slate-100 shadow-2xl">
                                    {contact?.name?.[0]?.toUpperCase() || "C"}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{contact?.name || "In Call..."}</h2>
                                <p className="text-xs md:text-sm font-medium text-slate-400 mt-1">{callStatus}</p>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-4 right-4 md:top-6 md:right-6 h-36 w-28 md:h-48 md:w-36 overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-slate-950 shadow-2xl z-10 transition-all">
                        {localStream && isVideoOn ? (
                            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                        ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-slate-400">
                                <VideoOff size={20} className="mb-1" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Off</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="relative z-20 w-full pt-2 pb-6 px-4 flex justify-center bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))" }}>
                <div className="flex items-center justify-center gap-4 md:gap-6 rounded-full bg-slate-900/90 border border-slate-700/80 px-6 py-3.5 shadow-2xl backdrop-blur-xl">
                    <button onClick={toggleMute} aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"} className="flex flex-col items-center gap-1 group">
                        <div className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full transition-all active:scale-90 shadow-md ${isMuted ? "bg-red-600 text-white shadow-red-600/30" : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"}`}>
                            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200">{isMuted ? "Unmute" : "Mute"}</span>
                    </button>

                    <button onClick={toggleVideo} aria-label={isVideoOn ? "Turn Off Camera" : "Turn On Camera"} className="flex flex-col items-center gap-1 group">
                        <div className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full transition-all active:scale-90 shadow-md ${!isVideoOn ? "bg-red-600 text-white shadow-red-600/30" : "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700"}`}>
                            {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200">{isVideoOn ? "Cam Off" : "Cam On"}</span>
                    </button>

                    <button onClick={endCall} aria-label="End Call" className="flex flex-col items-center gap-1 group">
                        <div className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-red-600 hover:bg-red-500 active:scale-90 text-white transition-all shadow-lg shadow-red-600/40">
                            <PhoneOff size={22} />
                        </div>
                        <span className="text-[10px] font-semibold text-red-400 group-hover:text-red-300">End</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Call;