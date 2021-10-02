
const BLUE_TEAM = 'blueTeam';
const YELLOW_TEAM = 'yellowTeam';

const INITIAL = 1;
const PLAYING = 2;
const FINISHED = 3;

const SELECT_POKEMON = 1;
const CREATE_QUESTION = 2;
const ANSWER_QUESTION = 3;
const GUESS = 4;

const NO_VOTE = 'isento';

const rooms = [];
const onlineUsers = [];

const addRoom = ({playerName, playerId}) => {
  const userIsOnline = onlineUsers.find((user) => user.playerName === playerName)
  if (userIsOnline) return {error: 'User already online.'}

  const newRoom = {
    roomData: {
      roomOwner: playerName, 
      roomId: playerId
    },
    gameInfo: {
      status: INITIAL, 
      rounds: 1, 
      stage: SELECT_POKEMON, 
      currentRound: 1,
      message: '',
    },
    gameCards: [],
    blueTeam: { 
      selectedCards: [], 
      pokemon: undefined, 
      players: [{playerName, playerId}], 
      questions: [],
      score: 0
    },
    yellowTeam: { 
      selectedCards: [], 
      pokemon: undefined, 
      players: [],
      questions: [],
      score: 0
    },
  }
  
  const existingRoom = rooms.find((room) => room.roomData.roomOwner === newRoom.roomData.roomOwner);
  onlineUsers.push({ playerName, playerId })

  if (existingRoom) {
    const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === newRoom.roomData.roomOwner);
    rooms[indexRoom].roomData.roomId = playerId
    const blueTeamPlayers = rooms[indexRoom].blueTeam.players
    rooms[indexRoom].blueTeam.players = [...blueTeamPlayers, {playerName, playerId}]
    return {room: rooms[indexRoom]};
  }
  rooms.push(newRoom);
  return {room: newRoom};
};

const updateRoomCards = ({roomId, newCards}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);

  if (indexRoom === -1) return {error: 'Room not found!'}
  rooms[indexRoom].gameCards = newCards

  return {room: rooms[indexRoom]}
}

const updateRoomRounds = ({roomId, rounds}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);

  if (indexRoom === -1) return {error: 'Room not found!'}
  rooms[indexRoom].gameInfo.rounds = rounds

  return {room: rooms[indexRoom]}
}

const startGame = ({roomId}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);

  if (indexRoom === -1) return {error: 'Room not found!'}
  rooms[indexRoom].gameInfo.status = PLAYING

  return {room: rooms[indexRoom]}
}

const updateRoomPlayers = ({roomId, player}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }

  if ((rooms[indexRoom].blueTeam.players.length + rooms[indexRoom].yellowTeam.players.length) >= 10) {
    return {error: 'Room is full!'}
  }

  const playersInRoom = rooms[indexRoom].blueTeam.players
  .concat(rooms[indexRoom].yellowTeam.players)
  .map((playerInRoom) => playerInRoom.playerName)

  if (playersInRoom.includes(player.playerName)) {
    return {error: 'User is in the room!'}
  }

  if (rooms[indexRoom].blueTeam.players.length > rooms[indexRoom].yellowTeam.players.length) {
    rooms[indexRoom].yellowTeam.players.push(player)
  } else {
    rooms[indexRoom].blueTeam.players.push(player)
  }
  return {room: rooms[indexRoom]}
}

const selectPokemon = ({roomId, playerTeam, pokemon}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }

  rooms[indexRoom][playerTeam].selectedCards.push(pokemon)

  if (rooms[indexRoom].blueTeam.selectedCards.length >= 5
    && rooms[indexRoom].yellowTeam.selectedCards.length >= 5) {
    const cardsBlue = rooms[indexRoom].blueTeam.selectedCards
    const cardsYellow = rooms[indexRoom].yellowTeam.selectedCards
    const randomIndexBlue = Math.floor(Math.random() * cardsBlue.length)
    const randomIndexYellow = Math.floor(Math.random() * cardsYellow.length)
    rooms[indexRoom].blueTeam.pokemon = cardsBlue[randomIndexBlue]
    rooms[indexRoom].yellowTeam.pokemon = cardsYellow[randomIndexYellow]
  }

  if (rooms[indexRoom].blueTeam.pokemon && rooms[indexRoom].yellowTeam.pokemon) {
    rooms[indexRoom].gameInfo.stage = CREATE_QUESTION
  }

  return {room: rooms[indexRoom]}
}

const createQuestion = ({roomId, playerTeam, question}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }

  rooms[indexRoom][playerTeam].questions.push({question, answer: undefined})
  
  if (rooms[indexRoom].blueTeam.questions.length >= 3 
    && rooms[indexRoom].yellowTeam.questions.length >= 3) {
    rooms[indexRoom].gameInfo.stage = ANSWER_QUESTION
    rooms[indexRoom].blueTeam.questions = rooms[indexRoom].blueTeam.questions.slice(0, 3)
    rooms[indexRoom].yellowTeam.questions = rooms[indexRoom].yellowTeam.questions.slice(0, 3)
  }

  return {room: rooms[indexRoom]}
}

const answerQuestion = ({roomId, team, question, answer}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }

  rooms[indexRoom][team].questions[question].answer = answer

  let blueTeamAnsweredAll= true
  let yellowTeamAnsweredAll = true

  for(qIndex = 0; qIndex < 3; qIndex++) {
    if (!rooms[indexRoom].blueTeam.questions[qIndex].answer) blueTeamAnsweredAll = false
    if (!rooms[indexRoom].yellowTeam.questions[qIndex].answer) yellowTeamAnsweredAll = false
  }

  if (blueTeamAnsweredAll && yellowTeamAnsweredAll) {
    rooms[indexRoom].gameInfo.stage = GUESS;
  }

  return {room: rooms[indexRoom]}
}

function getMostFrequent(arr) {
  const wordCounts = {}
  for(i = 0; i < arr.length; i++)
    wordCounts[arr[i]] = (wordCounts[arr[i]] || 0) + 1;
  return Object.keys(wordCounts).reduce((a, b) => wordCounts[a] > wordCounts[b] ? a : b)
}

function getResult(value, expectedValue) {
  if (value === expectedValue) return 'A';
  else return 'E'
}

const pointsTable = {
  AE: { team: BLUE_TEAM, points: 2},
  AI: { team: BLUE_TEAM, points: 3},
  IE: { team: BLUE_TEAM, points: 1},
  EA: { team: YELLOW_TEAM, points: 2},
  IA: { team: YELLOW_TEAM, points: 3},
  EI: { team: YELLOW_TEAM, points: 1},
  AA: { team: null, points: 0},
  EE: { team: null, points: 0},
  II: { team: null, points: 0},
}

const result = ({roomId}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }

  const blueTeamPlayers = rooms[indexRoom].blueTeam.players.map((player) => player)
  const yellowTeamPlayers = rooms[indexRoom].yellowTeam.players.map((player) => player)
  const blueTeamCandidates = blueTeamPlayers.map(({playerGuess}) => playerGuess)
  const yellowTeamCandidates = yellowTeamPlayers.map(({playerGuess}) => playerGuess)
  
  const blueTeamWinner = getMostFrequent(blueTeamCandidates)
  const yellowTeamWinner = getMostFrequent(yellowTeamCandidates)
  const blueRes = (blueTeamWinner === NO_VOTE) ? 'I' : getResult(blueTeamWinner, rooms[indexRoom].yellowTeam.pokemon)
  const yellowRes = (yellowTeamWinner === NO_VOTE) ? 'I' : getResult(yellowTeamWinner, rooms[indexRoom].blueTeam.pokemon)
  const winnerTeam = pointsTable[`${blueRes}${yellowRes}`]
  if (winnerTeam.points !== 0) {
    rooms[indexRoom][winnerTeam.team].score += winnerTeam.points
    rooms[indexRoom].gameInfo.message = `O time ${winnerTeam.team === BLUE_TEAM ? 'azul' : 'amarelo'}
    marcou ${winnerTeam.points} pontos!
    `
  } else {
    rooms[indexRoom].gameInfo.message = `Empate! Nenhuma equipe marcou pontos.`
  }

  rooms[indexRoom].gameInfo.message += ` Pokemon da equipe azul: ${rooms[indexRoom].blueTeam.pokemon}.
  Pokemon da equipe amarela: ${rooms[indexRoom].yellowTeam.pokemon}.`
  

  rooms[indexRoom].blueTeam.selectedCards = [];
  rooms[indexRoom].yellowTeam.selectedCards = [];
  rooms[indexRoom].blueTeam.questions = [];
  rooms[indexRoom].yellowTeam.questions = [];
  rooms[indexRoom].blueTeam.pokemon = undefined;
  rooms[indexRoom].yellowTeam.pokemon = undefined;
  rooms[indexRoom].blueTeam.players = rooms[indexRoom].blueTeam.players.map(({playerName, playerId}) => ({playerName, playerId}))
  rooms[indexRoom].yellowTeam.players = rooms[indexRoom].yellowTeam.players.map(({playerName, playerId}) => ({playerName, playerId}))
  rooms[indexRoom].gameInfo.stage = SELECT_POKEMON;
  rooms[indexRoom].gameInfo.currentRound += 1;
  
  if (rooms[indexRoom].gameInfo.currentRound > rooms[indexRoom].gameInfo.rounds) {
    rooms[indexRoom].gameInfo.currentRound = 1;
    rooms[indexRoom].gameInfo.rounds = 1;
    rooms[indexRoom].gameInfo.status = FINISHED
  }

  return {room: rooms[indexRoom]}
}

const guessing = ({roomId, playerTeam, playerName, guess}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }

  const players = rooms[indexRoom][playerTeam].players.map((p) => p.playerName)

  const indexPlayer = players.findIndex((player) => player === playerName)
  if (indexPlayer === -1) {
    return {error: 'Player not found!'}
  }

  rooms[indexRoom][playerTeam].players[indexPlayer].playerGuess = guess

  let blueTeamGuessVerify = true
  let yellowTeamGuessVerify = true
  rooms[indexRoom].blueTeam.players.forEach((player) => {
    if(!player.playerGuess) blueTeamGuessVerify = false
  })
  rooms[indexRoom].yellowTeam.players.forEach((player) => {
    if(!player.playerGuess) yellowTeamGuessVerify = false
  })

  if (blueTeamGuessVerify && yellowTeamGuessVerify) {
    return result({roomId})
  }

  return {room: rooms[indexRoom]}
}

const restartGame = ({roomId}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomId);
  if (indexRoom === -1) { 
    return {error: 'Room not found!'}
  }
  rooms[indexRoom].gameInfo.status = INITIAL
  rooms[indexRoom].gameInfo.message = 'Nova partida.'
  rooms[indexRoom].blueTeam.score = 0;
  rooms[indexRoom].yellowTeam.score = 0;

  return {room: rooms[indexRoom]}
}

const exitRoom = ({playerId, roomOwner}) => {
  const indexRoom = rooms.findIndex((room) => room.roomData.roomOwner === roomOwner);
  if (indexRoom !== -1) {
    const blueTeam = rooms[indexRoom].blueTeam.players.filter((player) => player.playerId !== playerId)
    rooms[indexRoom].blueTeam.players = blueTeam
    const yellowTeam = rooms[indexRoom].yellowTeam.players.filter((player) => player.playerId !== playerId)
    rooms[indexRoom].yellowTeam.players = yellowTeam

    if ((rooms[indexRoom].blueTeam.players.length + rooms[indexRoom].yellowTeam.players.length) === 0) {
      rooms.splice(indexRoom, 1);
      return {error: 'Room closed, because was empty.'}
    }
  
    return {room: rooms[indexRoom]}
  }

  return {error: "Room doesn't exists."}
}

const removePlayer = ({playerId}) => {
  const index = onlineUsers.findIndex((user) => user.playerId === playerId);
  if (index !== -1) onlineUsers.splice(index, 1);
}

module.exports = { 
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
};
