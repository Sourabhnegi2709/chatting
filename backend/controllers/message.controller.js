import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const buildRoomId = (a, b) => [a, b].sort().join('_');

/**
 * GET /api/messages/:contactId?before=<messageId>&limit=30
 * Cursor-based pagination (by _id, which is time-ordered) — stable even
 * while new messages keep arriving, unlike offset/skip pagination.
 */
export const getConversation = asyncHandler(async (req, res) => {
    const { contactId } = req.params;
    const { before, limit = 30 } = req.query;

    if (!mongoose.isValidObjectId(contactId)) {
        throw new ApiError(400, 'Invalid contact id.');
    }

    const roomId = buildRoomId(req.user._id.toString(), contactId);
    const pageSize = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const filter = { roomId };
    if (before && mongoose.isValidObjectId(before)) {
        filter._id = { $lt: before };
    }

    const messages = await Message.find(filter)
        .sort({ _id: -1 })
        .limit(pageSize)
        .lean();

    res.status(200).json({
        success: true,
        roomId,
        messages: messages.reverse(), // oldest-first for easy rendering
        hasMore: messages.length === pageSize,
    });
});

/**
 * PATCH /api/messages/:contactId/read
 * Marks all messages from a contact, in this room, as read.
 */
export const markConversationRead = asyncHandler(async (req, res) => {
    const { contactId } = req.params;

    if (!mongoose.isValidObjectId(contactId)) {
        throw new ApiError(400, 'Invalid contact id.');
    }

    const roomId = buildRoomId(req.user._id.toString(), contactId);

    const result = await Message.updateMany(
        { roomId, recipientId: req.user._id, status: { $ne: 'read' } },
        { $set: { status: 'read', readAt: new Date() } }
    );

    res.status(200).json({ success: true, updatedCount: result.modifiedCount });
});
