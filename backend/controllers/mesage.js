const Message = require("../models/Message");
const mongoose = require("mongoose");
const {
  InternalServerErrorException,
} = require("../execeptions/cutsom-exception");

const send_message = async (sender, body) => {
  const { receiver, content } = body;
  const message = new Message({ sender, receiver, content });
  await message.save();
  return message;
};

const get_threads = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const threads = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
        },
      },
      {
        $sort: { createdAt: -1 }, // Step 1: latest messages first
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" }, // Step 2: group by otherUser, keep latest
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          lastTimestamp: "$lastMessage.createdAt", // 🛠 Extract timestamp to top level
        },
      },
      {
        $sort: { lastTimestamp: -1 }, // ✅ Now you can sort by this safely
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          _id: 0,
          unreadCount: 1,
          lastActive: "$lastMessage.timestamp",
          lastMessage: {
            _id: "$lastMessage._id",
            sender: "$lastMessage.sender",
            receiver: "$lastMessage.receiver",
            content: "$lastMessage.content",
            timestamp: "$lastMessage.timestamp",
          },
          user: {
            _id: "$user._id",
            email: "$user.email",
            fullname: "$user.fullname",
            isOnline: "$user.isOnline",
            createdAt: "$user.createdAt",
            updatedAt: "$user.updatedAt",
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    res.json({ page, limit, threads });
  } catch (err) {
    console.error(err);
    next(new InternalServerErrorException("Error fetching threads"));
  }
};

const get_messages_with_user = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = mongoose.Types.ObjectId.createFromHexString(req.params.id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // use lean() to allow modifying returned objects

    // Add direction flag for frontend
    const processedMessages = messages.map((msg) => ({
      ...msg,
      direction: String(msg.sender) === String(userId) ? "sent" : "received",
    }));

    res.json({ page, limit, messages: processedMessages });
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException("Error fetching messages");
  }
};


const markThreadAsRead = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    let { fromUserId } = req.body;
    fromUserId = mongoose.Types.ObjectId.createFromHexString(fromUserId);

    const result = await Message.updateMany(
      {
        sender: fromUserId,
        receiver: currentUserId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    res.json({
      message: "Messages marked as read",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error(err);
    throw new InternalServerErrorException("Failed to mark messages as read");
  }
};

module.exports = {
  send_message,
  get_threads,
  get_messages_with_user,
  markThreadAsRead,
};
