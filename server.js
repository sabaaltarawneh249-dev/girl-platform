const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let users = {};

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("join", (data) => {

    users[socket.id] = data;

    socket.join(data.room);

  });

  socket.on("chat message", (data) => {

    const user =
      users[socket.id] ||
      {
        name: "Anonymous",
        room: "beginner"
      };

    io.to(user.room).emit("chat message", {
      name: user.name,
      text: data.text,
      type: data.type || "text",
      file: data.file || null,
      replyTo: data.replyTo || null,
      isAdmin:
        user.name.toLowerCase() === "admin"
    });

  });

  socket.on("announcement", (text) => {

    io.emit("chat message", {
      name: "👑 ADMIN",
      text: text,
      type: "announcement"
    });

  });

  socket.on("disconnect", () => {

    delete users[socket.id];

    console.log("User disconnected");

  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});