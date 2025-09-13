// ========================================
// 4. FIXED NOTIFICATION UTILS (notification.js)
// ========================================
let io;
let connectedUsers = {};

function initNotification(serverIo) {
  io = serverIo;

  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    socket.on("register", (userId) => {
      connectedUsers[userId] = socket.id;
      console.log("✅ Registered:", userId, socket.id);
    });

    // ✅ Allow admins to join admin room for notifications
    socket.on("joinAdmin", () => {
      socket.join("admins");
      console.log("🛡️ Admin joined:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      for (let uid in connectedUsers) {
        if (connectedUsers[uid] === socket.id) {
          delete connectedUsers[uid];
        }
      }
    });
  });
}

function sendNotification(userId, message) {
  const socketId = connectedUsers[userId];
  if (socketId && io) {
    io.to(socketId).emit("notification", message);
  }
}

// ✅ Send new registration notification to admin room
function broadcastNewRegistration(user) {
  if (io) {
    io.to("admins").emit("newUserRequest", user);
    console.log("📢 Broadcasting new user registration:", user.email);
  }
}

function broadcastUserApproved(userId) {
  if (io) {
    io.to("admins").emit("userApproved", { userId });
    console.log("✅ Broadcasting user approval:", userId);
  }
}

module.exports = {
  initNotification,
  sendNotification,
  broadcastNewRegistration,
  broadcastUserApproved,
};
