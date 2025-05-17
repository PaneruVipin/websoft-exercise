const { io } = require("socket.io-client");
require("dotenv").config();
const socket = io("http://localhost:3000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjcwZjg4MDE2OGRiY2I3NTk5YTJiZSIsImlhdCI6MTc0NzM5MDM0NSwiZXhwIjoxNzQ3MzkzOTQ1fQ.aI1VI2v1IiHn_mdCxzY8bmeIiON61Lwz8Xgsy4b44Uk",
  },
});

socket.on("connect", () => {
  console.log("Connected as:", socket.id);

  socket.emit("send_message", {
    receiver: "receiver-user-id",
    content: "Hello from test client!",
  });
});

socket.on("receive_message", (msg) => {
  console.log("Message received:", msg);
});

socket.on("connect_error", (err) => {
  console.error("Socket error:", err);
});


socket.on("error", (err) => {
  console.error("Socket error:", err);
});