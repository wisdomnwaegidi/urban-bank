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

module.exports = { initNotification, sendNotification };
