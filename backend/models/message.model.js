import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
    },
    recipientId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    roomId: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Ensure no TTL index is set on Message collection
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: undefined });

const Message = mongoose.model('Message', messageSchema);

export default Message;
