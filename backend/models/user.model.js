import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { generateAvatarUrl } from '../utils/avatar.js';

const historyEntrySchema = new mongoose.Schema(
    {
        roomId: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: 2,
            maxlength: 60,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'],
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: 5,
            select: false, // never returned by default on .find()/.findOne()
        },
        bio: {
            type: String,
            default: '',
            trim: true,
            maxlength: 280,
        },
        avatar: {
            type: String,
            default: '',
        },
        // Bounded so a very long-lived user doesn't grow this document unbounded
        history: {
            type: [historyEntrySchema],
            default: [],
        },
        lastSeenAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Cap history length so the document can't grow forever (keep most recent 50 rooms).
userSchema.pre('save', function capHistory(next) {
    if (this.history?.length > 50) {
        this.history = this.history.slice(-50);
    }
    next();
});

// Hash password only when it's new/changed — safe to call user.save() anywhere.
userSchema.pre('save', async function hashPassword(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Fill a default avatar once we know the name, if none was provided.
userSchema.pre('save', function fillAvatar(next) {
    if (!this.avatar) {
        this.avatar = generateAvatarUrl(this.name || this.email);
    }
    next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Controls what gets sent to the client whenever a user doc is JSON-serialized.
userSchema.methods.toJSON = function toSafeJSON() {
    const obj = this.toObject({ virtuals: true });
    delete obj.password;
    delete obj.__v;
    obj.id = obj._id;
    return obj;
};

userSchema.index({ createdAt: 1 }, { expireAfterSeconds: undefined }); // explicitly: never auto-expire users

const User = mongoose.model('User', userSchema);

export default User;
