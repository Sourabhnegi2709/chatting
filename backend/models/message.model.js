import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 4000,
        },
        roomId: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['sent', 'delivered', 'read'],
            default: 'sent',
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// This is the index that actually matches how the app queries messages:
// "give me this room's messages, newest/oldest first" — makes conversation
// loading fast even with millions of rows across all rooms.
messageSchema.index({ roomId: 1, createdAt: -1 });

// Explicitly disable TTL expiry — chat history should never silently vanish.
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: undefined });

const Message = mongoose.model('Message', messageSchema);

export default Message;
