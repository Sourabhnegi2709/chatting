import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: '',
    },
    history: [
        {
            roomId: {
                type: String,
                required: true,
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
}, { timestamps: true });

// Ensure no TTL index is set on User collection
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: undefined });

const User = mongoose.model("User", userSchema);

export default User;
