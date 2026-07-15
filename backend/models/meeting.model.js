import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meetingId: {
    type: String,
  },
  timeOnline:{
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Ensure no TTL index is set on Meeting collection
meetingSchema.index({ createdAt: 1 }, { expireAfterSeconds: undefined });

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
