import Meeting from '../models/meeting.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/calls/history?page=1&limit=20
 * Returns this user's call history (as caller or recipient), newest first.
 */
export const getCallHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 50);

    const filter = { $or: [{ callerId: req.user._id }, { recipientId: req.user._id }] };

    const [calls, total] = await Promise.all([
        Meeting.find(filter)
            .populate('callerId', 'name avatar')
            .populate('recipientId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean(),
        Meeting.countDocuments(filter),
    ]);

    res.status(200).json({ success: true, calls, total, page: pageNum });
});
