import User from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token.js';

const normalizeEmail = (email) => email?.toLowerCase?.().trim?.() || '';

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, 'Email and password are required.');
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');

    // Same error message whether the email doesn't exist or the password is
    // wrong — avoids leaking which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    user.lastSeenAt = new Date();
    await user.save({ validateModifiedOnly: true });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        user,
        token,
    });
});

export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
        throw new ApiError(400, 'Name, email, and password are required.');
    }
    if (password.length < 5) {
        throw new ApiError(400, 'Password must be at least 5 characters.');
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new ApiError(409, 'An account with this email already exists.');
    }

    // Password hashing happens inside User's pre-save hook — one implementation, no drift.
    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });

    const token = signToken(user._id);
    setAuthCookie(res, token);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
        token,
    });
});

export const getUsers = asyncHandler(async (req, res) => {
    const { search = '', page, limit } = req.query;

    const filter = { _id: { $ne: req.user._id } }; // never return yourself as a "contact"

    if (search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [{ name: regex }, { email: regex }];
    }

    let query = User.find(filter).sort({ name: 1 });

    // Pagination is opt-in via query params so existing frontend calls
    // (no page/limit) keep getting the full contact list, unchanged.
    if (page || limit) {
        const pageNum = Math.max(Number(page) || 1, 1);
        const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 100);
        query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const users = await query;
    const total = await User.countDocuments(filter);

    res.status(200).json({ success: true, users, total });
});

export const logout = asyncHandler(async (req, res) => {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
    // req.user is populated by requireAuth middleware, already verified against the DB.
    res.status(200).json({ success: true, user: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, email, bio } = req.body;

    if (!name?.trim()) throw new ApiError(400, 'Name is required.');

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new ApiError(400, 'Email is required.');

    if (normalizedEmail !== req.user.email) {
        const duplicate = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
        if (duplicate) throw new ApiError(409, 'Email already in use.');
    }

    req.user.name = name.trim();
    req.user.email = normalizedEmail;
    req.user.bio = bio?.trim?.() || '';
    await req.user.save();

    res.status(200).json({ success: true, user: req.user });
});
