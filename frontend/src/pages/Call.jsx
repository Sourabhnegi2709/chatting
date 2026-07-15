import {
    ArrowLeft,
    Mic,
    MicOff,
    PhoneOff,
    Video,
    VideoOff,
    Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { connectSocket } from "../services/socket";

const STUN_SERVERS = [
    { urls: ["stun:stun.l.google.com:19302"] },
    { urls: ["stun:stun1.l.google.com:19302"] },
    { urls: ["stun:stun2.l.google.com:19302"] },
];

const buildCallId = (id1, id2) => [id1, id2].sort().join('_');

const Call = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const contact = location.state?.contact;

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [callStatus, setCallStatus] = useState(contact ? "Initializing..." : "Ready to call");
    const [incomingCall, setIncomingCall] = useState(null);
    const [error, setError] = useState(null);

    const socketRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callStartedRef = useRef(false);
    const currentCallIdRef = useRef(null);

    const getUserId = (value) => value?.id || value?._id || value;
    const currentUserId = getUserId(user);
    const contactUserId = getUserId(contact);

    // Helper to emit socket events safely
    const emitToSocket = useCallback((event, data) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.error(`Socket not connected for event: ${event}`);
        }
    }, []);

    // Get media stream
    const getMediaStream = useCallback(async () => {
        try {
            console.log("📹 Requesting media devices...");
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: { ideal: 1280 }, height: { ideal: 720 } }, 
                audio: true 
            });
            console.log("✅ Media stream acquired");
            setLocalStream(stream);
            setError(null);
            return stream;
        } catch (err) {
            const errorMsg = `❌ Media error: ${err.name} - ${err.message}`;
            console.error(errorMsg);
            setError(errorMsg);
            setCallStatus("Permission denied - check camera/mic access");
            throw err;
        }
    }, []);

    // Create peer connection
    const createPeerConnection = useCallback(async () => {
        console.log("🔗 Creating peer connection...");

        let stream = localStream;
        if (!stream) {
            stream = await getMediaStream();
        }

        const peerConnection = new RTCPeerConnection({
            iceServers: STUN_SERVERS,
        });

        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        peerConnection.ontrack = (event) => {
            console.log(`📥 Received remote ${event.track.kind} track`);
            if (event.streams?.[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            console.log(`📊 Connection state: ${state}`);
            if (state === "connected" || state === "completed") {
                setCallStatus("✅ Connected");
            } else if (state === "failed") {
                setCallStatus("❌ Connection failed");
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                console.log("🧊 Sending ICE candidate");
                emitToSocket("ice-candidate", {
                    callId: currentCallIdRef.current,
                    recipientUserId: contactUserId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnectionRef.current = peerConnection;
        return peerConnection;
    }, [localStream, getMediaStream, contactUserId, emitToSocket]);

    // Cleanup
    const cleanupCall = useCallback(() => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setIncomingCall(null);
        callStartedRef.current = false;
        currentCallIdRef.current = null;
    }, [localStream]);

    // Socket Setup
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

        // Socket Listeners
        const handleIncomingCall = ({ callId, caller, offer }) => {
            console.log(`📞 Incoming call from ${caller?.name}`);
            setIncomingCall({ callId, caller, offer });
            setCallStatus(`Incoming call from ${caller?.name}`);
            currentCallIdRef.current = callId;
        };

        const handleCallAccepted = async ({ callId, answer }) => {
            console.log("✅ Received answer from other side");
            try {
                if (peerConnectionRef.current) {
                    await peerConnectionRef.current.setRemoteDescription(
                        new RTCSessionDescription(answer)
                    );
                    setCallStatus("Connecting...");
                }
            } catch (err) {
                console.error("Error setting remote description:", err);
            }
        };

        const handleCallRejected = () => {
            setCallStatus("Call declined");
            cleanupCall();
        };

        const handleCallEnded = ({ reason }) => {
            setCallStatus("Call ended");
            cleanupCall();
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

        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", handleCallEnded);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", handleCallEnded);
            socket.off("ice-candidate", handleIceCandidate);
        };
    }, [user, currentUserId, cleanupCall]);

    // Start outgoing call
    useEffect(() => {
        if (!contact || !contactUserId || !currentUserId || callStartedRef.current) return;

        const initCall = async () => {
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

                setCallStatus(`Calling ${contact.name}...`);
            } catch (error) {
                console.error("Failed to start call:", error);
                setCallStatus("Failed to start call");
            }
        };

        initCall();
    }, [contact, contactUserId, currentUserId, user, getMediaStream, createPeerConnection, emitToSocket]);

    const acceptCall = async () => {
        if (!incomingCall) return;

        try {
            callStartedRef.current = true;
            const peerConnection = await createPeerConnection();

            await peerConnection.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            emitToSocket("accept-call", {
                callId: incomingCall.callId,
                answer,
            });

            currentCallIdRef.current = incomingCall.callId;
            setIncomingCall(null);
            setCallStatus("Connecting...");
        } catch (error) {
            console.error("Accept call failed:", error);
        }
    };

    const rejectCall = () => {
        if (incomingCall?.callId) {
            emitToSocket("reject-call", { callId: incomingCall.callId });
        }
        cleanupCall();
        navigate(-1);
    };

    const endCall = () => {
        if (currentCallIdRef.current) {
            emitToSocket("end-call", { 
                callId: currentCallIdRef.current,
                recipientUserId: contactUserId 
            });
        }
        cleanupCall();
        navigate(-1);
    };

    const toggleMute = () => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
        });
        setIsMuted(!isMuted);
    };

    const toggleVideo = () => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach(track => {
            track.enabled = !isVideoOn;
        });
        setIsVideoOn(!isVideoOn);
    };

    // Local Video
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Remote Video
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    return (
        <div className="h-screen w-full bg-gradient-to-b from-zinc-900 to-black text-white flex flex-col">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
                <button onClick={() => navigate(-1)} className="rounded-full bg-white/10 p-2 hover:bg-white/20">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-lg font-medium md:text-xl">Video Call</h1>
                <div className="w-10" />
            </div>

            <div className="flex-1 px-4 py-2 md:px-8">
                <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl">
                    {remoteStream ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-3xl font-semibold">
                                {contact?.name?.[0] || "C"}
                            </div>
                            <h2 className="text-2xl font-semibold">{contact?.name}</h2>
                            <p className="text-sm text-zinc-400">{callStatus}</p>
                        </div>
                    )}

                    {/* Local Video */}
                    <div className="absolute bottom-4 right-4 h-32 w-24 overflow-hidden rounded-2xl border border-white/20 bg-zinc-900 shadow-xl md:h-40 md:w-32">
                        {localStream ? (
                            <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-zinc-400">Camera preview</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Incoming Call UI */}
            {incomingCall && (
                <div className="mx-4 mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    <p className="font-semibold">Incoming call from {incomingCall.caller?.name}</p>
                    <div className="mt-3 flex gap-3">
                        <button onClick={acceptCall} className="rounded-full bg-emerald-500 px-6 py-2 font-medium text-white">Accept</button>
                        <button onClick={rejectCall} className="rounded-full bg-zinc-700 px-6 py-2 font-medium text-white">Decline</button>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="pb-8 px-4">
                <div className="flex items-center justify-center gap-6">
                    <button onClick={toggleMute} className={`rounded-full p-4 ${isMuted ? "bg-red-500" : "bg-white/10"}`}>
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button onClick={toggleVideo} className={`rounded-full p-4 ${!isVideoOn ? "bg-red-500" : "bg-white/10"}`}>
                        {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>
                    <button onClick={endCall} className="rounded-full bg-red-600 p-4 hover:bg-red-700">
                        <PhoneOff size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Call;