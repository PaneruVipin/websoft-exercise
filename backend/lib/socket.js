const { send_message } = require("../controllers/mesage");
const authenticate = require("../middlewares/socket-auth");
const User = require("../models/User");

const onlineUsers = new Map();

function setupSocket(io) {
  // Middleware to authenticate socket connections
  io.use(authenticate);

  // Handle socket connections
  io.on("connection", (socket) => {
    const userId = socket.user._id;
    console.log("New client connected");

    // Track user connection
    socket.on("user_connected", async () => {
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit("user_status_change", { userId, isOnline: true });
    });

    // Send message
    socket.on("send_message", async ({ receiver, content }) => {
      try {
        const message = await send_message(userId, {
          receiver,
          content,
        });

        const receiverSocket = onlineUsers.get(receiver);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", message);
        }

        socket.emit("message_sent", { messageId: message._id });
      } catch (err) {
        console.error("Send message failed:", err.message);
        socket.emit("error", { message: err.message });
      }
    });

    // Typing indicator
    socket.on("typing", ({ toUserId }) => {
      const socketId = onlineUsers.get(toUserId);
      if (socketId) {
        io.to(socketId).emit("typing", { fromUserId: userId });
      }
    });

    // Disconnect handling
    socket.on("disconnect", async () => {
      for (const [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { isOnline: false });
          io.emit("user_status_change", { userId, isOnline: false });
          break;
        }
      }
    });
  });
}

module.exports = { setupSocket };
