import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const memoryUsers = new Map();
const memoryUsersById = new Map();

const normalizeEmail = (email) => email?.toLowerCase?.().trim?.() || '';

const buildUserPayload = (user) => ({
    id: user._id?.toString?.() || user.id,
    _id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    avatar: user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || 'user')}`,
});

const storeMemoryUser = (user) => {
    const normalizedEmail = normalizeEmail(user.email);
    if (!normalizedEmail) return user;

    memoryUsers.set(normalizedEmail, user);
    memoryUsersById.set(user._id?.toString?.() || user.id, user);
    return user;
};

const isDbConfigured = Boolean(process.env.MONGO_URL);

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = normalizeEmail(email);

        let user;
        if (isDbConfigured) {
            user = await User.findOne({ email: normalizedEmail });
        } else {
            user = memoryUsers.get(normalizedEmail);
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ userId: user._id || user.id }, process.env.JWT_SECRET || 'chat-secret', { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: 'Login successful',
            user: buildUserPayload(user),
            token,
        });
    } catch (err) {
        console.error('❌ Login Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const normalizedEmail = normalizeEmail(email);

        if (isDbConfigured) {
            const existingUser = await User.findOne({ email: normalizedEmail });
            if (existingUser) {
                return res.status(409).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await User.create({ name, email: normalizedEmail, password: hashedPassword });

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'chat-secret', { expiresIn: '7d' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            return res.status(201).json({
                message: 'User registered successfully',
                user: buildUserPayload(user),
            });
        }

        if (memoryUsers.has(normalizedEmail)) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = {
            id: `${Date.now()}`,
            _id: `${Date.now()}`,
            name,
            email: normalizedEmail,
            password: hashedPassword,
            bio: '',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        };

        storeMemoryUser(user);

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'chat-secret', { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: buildUserPayload(user),
            token,
        });
    } catch (err) {
        console.error('❌ Register Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getUsers = async (req, res) => {
    try {
        if (isDbConfigured) {
            const users = await User.find({}, 'name email avatar').lean();
            return res.status(200).json({ users: users.map(buildUserPayload) });
        }

        const users = Array.from(memoryUsers.values()).map(buildUserPayload);
        return res.status(200).json({ users });
    } catch (err) {
        console.error('❌ Get Users Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('❌ Logout Error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const me = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const payload = jwt.verify(token, process.env.JWT_SECRET || 'chat-secret');
        const userId = payload?.userId;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        if (!isDbConfigured) {
            const user = memoryUsersById.get(userId);
            if (!user) return res.status(401).json({ message: 'Not authenticated' });
            return res.status(200).json({ user: buildUserPayload(user) });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(401).json({ message: 'Not authenticated' });

        return res.status(200).json({ user: buildUserPayload(user) });
    } catch (err) {
        return res.status(401).json({ message: 'Not authenticated' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) return res.status(401).json({ message: 'Not authenticated' });

        const payload = jwt.verify(token, process.env.JWT_SECRET || 'chat-secret');
        const userId = payload?.userId;
        if (!userId) return res.status(401).json({ message: 'Not authenticated' });

        const { name, email, bio } = req.body;
        const normalizedEmail = normalizeEmail(email);

        if (!name?.trim()) {
            return res.status(400).json({ message: 'Name is required.' });
        }

        if (!normalizedEmail) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        if (!isDbConfigured) {
            const currentUser = memoryUsersById.get(userId);
            if (!currentUser) return res.status(401).json({ message: 'Not authenticated' });

            const duplicate = Array.from(memoryUsers.values()).find((entry) => entry.email === normalizedEmail && entry._id?.toString?.() !== userId);
            if (duplicate) {
                return res.status(409).json({ message: 'Email already in use.' });
            }

            memoryUsers.delete(normalizeEmail(currentUser.email));
            currentUser.name = name.trim();
            currentUser.email = normalizedEmail;
            currentUser.bio = bio?.trim?.() || '';
            memoryUsers.set(normalizedEmail, currentUser);
            memoryUsersById.set(userId, currentUser);

            return res.status(200).json({ user: buildUserPayload(currentUser) });
        }

        const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(401).json({ message: 'Not authenticated' });

        user.name = name.trim();
        user.email = normalizedEmail;
        user.bio = bio?.trim?.() || '';
        await user.save();

        return res.status(200).json({ user: buildUserPayload(user) });
    } catch (err) {
        console.error('❌ Update Profile Error:', err);
        return res.status(500).json({ message: 'Unable to update profile.' });
    }
};


