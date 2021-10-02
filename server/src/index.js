const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { 
  addRoom, 
  updateRoomCards, 
  updateRoomRounds, 
  startGame,
  updateRoomPlayers,
  selectPokemon,
  createQuestion,
  answerQuestion,
  guessing,
  restartGame,
  exitRoom,
  removePlayer,
} = require("./users.js");

const PORT = process.env.PORT || 5000

const app = express();

app.use(cors({origin: 'http://localhost:5000'}));

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on('connection', (socket) => {

  socket.on('join', (roomOwner) => {
    const {room, error} = addRoom({playerName: roomOwner, playerId: socket.id})
    if (error) {
      socket.emit('userAlreadyOnline')
      return;
    }
    socket.join(room.roomData.roomOwner)
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  });

  socket.on('updateCards', (roomId, newCards) => {
    const {room, error} = updateRoomCards({roomId, newCards})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  });

  socket.on('updateRounds', (roomId, rounds) => {
    const {room, error} = updateRoomRounds({roomId, rounds})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  });

  socket.on('startGame', (roomId) => {
    const {room, error} = startGame({roomId})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  });

  socket.on('selectPokemon', ({roomId, playerTeam, pokemon}) => {
    const {room, error} = selectPokemon({roomId, playerTeam, pokemon})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  })

  socket.on('createQuestion', ({roomId, playerTeam, question}) => {
    const {room, error} = createQuestion({roomId, playerTeam, question})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  })

  socket.on('answerQuestion', ({roomId, team, question, answer}) => {
    const {room, error} = answerQuestion({roomId, team, question, answer})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  })

  socket.on('guessing', ({roomId, playerTeam, playerName, guess}) => {
    const {room, error} = guessing({roomId, playerTeam, playerName, guess})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  })

  socket.on('restartGame', ({roomId}) => {
    const {room, error} = restartGame({roomId})
    if (error) return;
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  })

  socket.on('visitRoom', ({roomId, player}) => {
    const {room, error} = updateRoomPlayers({roomId, player: {playerName: player, playerId: socket.id}})
    if (error) return;
    socket.join(room.roomData.roomOwner)
    io.to(room.roomData.roomOwner).emit('newStateRoom', room)
  
    const roomsToExit = Array.from(socket.rooms).slice(1).filter((r) => r !== room.roomData.roomOwner)
    roomsToExit.forEach((roomOwner) => {
      const {room, error} = exitRoom({playerId: socket.id, roomOwner})
      if (room && !error) {
        socket.leave(roomOwner)
        io.to(room.roomData.roomOwner).emit('newStateRoom', room)
      }
    })
  });

  socket.on("disconnecting", () => {
    const roomsToExit = Array.from(socket.rooms).slice(1)
    console.log(roomsToExit)
    roomsToExit.forEach((roomOwner) => {
      const {room, error} = exitRoom({playerId: socket.id, roomOwner})
      if (room && !error) {
        io.to(room.roomData.roomOwner).emit('newStateRoom', room)
      }
    })
  });

  socket.on('disconnect', () => {
    removePlayer({playerId: socket.id})
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});