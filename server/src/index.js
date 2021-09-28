const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

const PORT = process.env.PORT || 5000

const router = require("./router.js")

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('We have a new connection c:');

  socket.join(user.room);

  socket.on('disconnect', () => {
    console.log('User had left.');
  });
});


app.use(router);

httpServer.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});