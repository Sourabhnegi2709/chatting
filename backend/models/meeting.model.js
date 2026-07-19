import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
    {
        callId: {
            type: String,
            required: true,
            index: true,
        },
        callerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['ringing', 'connected', 'rejected', 'missed', 'ended', 'failed'],
            default: 'ringing',
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        endedAt: {
            type: Date,
            default: null,
        },
        durationSeconds: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

meetingSchema.index({ callerId: 1, createdAt: -1 });
meetingSchema.index({ recipientId: 1, createdAt: -1 });
meetingSchema.index({ createdAt: 1 }, { expireAfterSeconds: undefined });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
