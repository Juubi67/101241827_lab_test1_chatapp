const jwt = require("jsonwebtoken");
const GroupMessage = require("./schema/GroupMessage");
const io = require("socket.io")(3031, {
  cors: {
    origin: ["http://localhost:8080"],
  },
});

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWTSECRET, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded);
    });
  });
};

function initSocket(server) {
  console.log("socket initialized.");
  const roomList = ["devops", "cloud computing", "covid19", "sports", "nodeJS"];

  io.on("connection", async (socket) => {
    // Access the token from the query parameters
    const token = socket.handshake.query.token;

    if (token) {
      try {
        const user = await verifyToken(token);

        if (user) {
          console.log(`user: ${user.userId} connected...`);

          // Join room event
          socket.on("joinRoom", (roomName) => {
            if (roomList.includes(roomName)) {
              socket.join(roomName);
              socket.broadcast.emit("user-joined", user.userId);
              console.log(`User ${user.userId} joined room: ${roomName}`);
            }
          });

          socket.on("send-message", (message, room) => {
            if (room) {
              const messageDb = new GroupMessage({
                room,
                message,
                from_user: user.userId,
                date_sent: new Date(),
              });
              messageDb.save();
              socket.to(room).emit("receive-message", message);
            } else {
              socket.broadcast.emit("receive-message", message);
            }
          });

          socket.on("disconnect", () => {
            socket.disconnect();
            console.log("User disconnected");
          });
        } else {
          socket.disconnect();
        }
      } catch (error) {
        console.log(error);
      }
    }
  });

  return io;
}

module.exports = initSocket;
