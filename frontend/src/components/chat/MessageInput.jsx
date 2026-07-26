import { Mic, Plus, SendHorizonal, Smile, Square, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EmojiPicker, { Theme, EmojiStyle } from "emoji-picker-react";
import IconButton from "../ui/IconButton";

const MessageInput = ({ onSendMessage, onSendVoice }) => {
    const [text, setText] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const textareaRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const emojiButtonRef = useRef(null);

    // Voice recording refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                emojiPickerRef.current &&
                !emojiPickerRef.current.contains(event.target) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(event.target)
            ) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopRecordingCleanup();
        };
    }, []);

    const stopRecordingCleanup = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm")
                    ? "audio/webm"
                    : "audio/mp4",
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: mediaRecorder.mimeType,
                });

                // Send the voice message
                if (onSendVoice) {
                    onSendVoice(audioBlob, recordingTime);
                } else if (onSendMessage) {
                    // Fallback: send as object so parent can detect it
                    onSendMessage({ type: "voice", blob: audioBlob, duration: recordingTime });
                }

                stopRecordingCleanup();
                setIsRecording(false);
                setRecordingTime(0);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setShowEmojiPicker(false);

            // Start timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Please allow microphone access to record voice messages.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            // Prevent the onstop from sending
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
        }
        stopRecordingCleanup();
        setIsRecording(false);
        setRecordingTime(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage(text);
            setText("");
            setShowEmojiPicker(false);
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const autoGrow = (e) => {
        setText(e.target.value);
        e.target.style.height = "auto";
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
    };

    const onEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji;
        const textarea = textareaRef.current;

        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newText = text.substring(0, start) + emoji + text.substring(end);
            setText(newText);

            requestAnimationFrame(() => {
                const newPos = start + emoji.length;
                textarea.focus();
                textarea.setSelectionRange(newPos, newPos);
                textarea.style.height = "auto";
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
            });
        } else {
            setText((prev) => prev + emoji);
        }
    };

    const hasText = text.trim().length > 0;

    // ========== RECORDING UI ==========
    if (isRecording) {
        return (
            <div
                className="flex items-center gap-3 px-3 py-2.5 bg-white border-t border-zinc-200"
                style={{
                    paddingBottom: "max(0.625rem, env(safe-area-inset-bottom, 0px))",
                }}
            >
                {/* Cancel */}
                <IconButton onClick={cancelRecording} aria-label="Cancel recording">
                    <X size={22} className="text-zinc-500" />
                </IconButton>

                {/* Recording indicator + timer */}
                <div className="flex-1 flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-2.5">
                    <div className="relative">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-40" />
                    </div>
                    <span className="text-sm font-medium text-red-600 tabular-nums">
                        {formatTime(recordingTime)}
                    </span>
                    <span className="text-sm text-red-400">Recording...</span>
                </div>

                {/* Stop & Send */}
                <IconButton
                    onClick={stopRecording}
                    variant="solid"
                    aria-label="Stop and send"
                    className="bg-red-500 hover:bg-red-600"
                >
                    <Square size={18} fill="currentColor" />
                </IconButton>
            </div>
        );
    }

    // ========== NORMAL INPUT UI ==========
    return (
        <div className="relative">
            {/* Emoji Picker */}
            <AnimatePresence>
                {showEmojiPicker && (
                    <motion.div
                        ref={emojiPickerRef}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-2 mb-2 z-50 shadow-xl rounded-2xl overflow-hidden border border-zinc-200"
                    >
                        <EmojiPicker
                            onEmojiClick={onEmojiClick}
                            theme={Theme.LIGHT}
                            emojiStyle={EmojiStyle.NATIVE}
                            width={320}
                            height={380}
                            searchPlaceHolder="Search emoji..."
                            previewConfig={{ showPreview: false }}
                            skinTonesDisabled
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div
                className="flex items-end gap-1.5 px-3 py-2.5 bg-white border-t border-zinc-200"
                style={{
                    paddingBottom: "max(0.625rem, env(safe-area-inset-bottom, 0px))",
                }}
            >
                <div className="flex items-center gap-0.5 pb-1">
                    <div ref={emojiButtonRef}>
                        <IconButton
                            aria-label="Emoji"
                            onClick={() => setShowEmojiPicker((prev) => !prev)}
                            className={showEmojiPicker ? "text-emerald-600" : ""}
                        >
                            <Smile size={22} />
                        </IconButton>
                    </div>
                    <IconButton aria-label="Attach">
                        <Plus size={22} />
                    </IconButton>
                </div>

                <div className="flex-1 flex items-end bg-zinc-100 rounded-2xl px-3.5 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-shadow">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onChange={autoGrow}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 resize-none bg-transparent outline-none text-sm text-zinc-900 placeholder:text-zinc-500 max-h-[120px] py-1 leading-relaxed"
                    />
                </div>

                <div className="pb-1">
                    <AnimatePresence mode="wait" initial={false}>
                        {hasText ? (
                            <motion.div
                                key="send"
                                initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <IconButton
                                    onClick={handleSend}
                                    variant="solid"
                                    aria-label="Send message"
                                >
                                    <SendHorizonal size={20} />
                                </IconButton>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mic"
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                            >
                                <IconButton
                                    onClick={startRecording}
                                    aria-label="Voice message"
                                >
                                    <Mic size={22} />
                                </IconButton>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;