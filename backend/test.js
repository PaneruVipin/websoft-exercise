const { io } = require("socket.io-client");
require("dotenv").config();
const socket = io("http://localhost:3000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MjcwZjg4MDE2OGRiY2I3NTk5YTJiZSIsImlhdCI6MTc0NzUyMTAzNCwiZXhwIjoxNzQ3NjA3NDM0fQ.ucMvxt2q_0t5p1Gz7I-HEbyJVcpHHfA2w3oWLslMrCg",
  },
});

socket.on("connect", () => {
  console.log("Connected as:", socket.id);

  socket.emit("user_connected");

  socket.emit("send_message", {
    receiver: "68270f880168dbcb7599a2be",
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
