import React, { useState, useEffect } from 'react'
import { io } from "socket.io-client";
import { getPokemons } from '../../api/pokedex.js';

import Pokemon from '../Card/Pokemon';
import GameInicialization from './GameInicialization.js';
import GameRunning from './GameRunning.js';

import './styles.css'

const ENDPOINT = "https://poke-guess-backend.herokuapp.com/"

let socket = undefined;

const INITIAL = 1;
const PLAYING = 2;
const FINISHED = 3;

const BLUE_TEAM = 'blueTeam';
const YELLOW_TEAM = 'yellowTeam';

const SELECT_POKEMON = 1;
const QUESTION_PHASE = 2.1;
const ANSWER_QUESTION = 3;
const GUESS = 4;

const YES = 1;
const NO = 2;
const INAPPROPRIATE = 3;

const Room = ({ player }) => {
  const [room, setRoom] = useState(undefined);
  const [roomId, setRoomId] = useState('');
  const [accountAlreadyInUse, setAccountAlreadyInUse] = useState(false);
  const [playerTeam, setPlayerTeam] = useState(BLUE_TEAM);
  const [enemyTeam, setEnemyTeam] = useState(YELLOW_TEAM)

  const fetchPokemons = async (page) => {
    const {data, error} = await getPokemons(page);
    if (error) return;
    if (socket) socket.emit('updateCards', room.roomData.roomOwner, data)
  }

  const handleGameCards = (e) => {
    if (e.key !== 'Enter') return;
    const page = e.target.value
    if (1 > page || page > 32) return;
    fetchPokemons(page)
  }

  const handleGameRounds = (e) => {
    if (e.key !== 'Enter') return;
    const rounds = e.target.value
    if (1 > rounds || rounds > 5) return;
    if (socket) socket.emit('updateRounds',  room.roomData.roomOwner, parseInt(rounds))
  }

  const handleGameStart = () => {
    if (socket && room.gameCards.length === 25 
    && room.blueTeam.players.length >= 1 && room.yellowTeam.players.length >= 1) {
      socket.emit('startGame', room.roomData.roomOwner)
    } else {
      alert('Para iniciar uma partida é necessário ter ao menos um player em cada time e uma cartela selecionada!')
    }
  }

  const handleRoomAccess = () => {
    if (socket) socket.emit('visitRoom', {roomId, player: player.user.username})
  }

  const handleGuessing = (guess) => {
    if (socket) socket.emit('guessing', {roomId: room.roomData.roomOwner, playerTeam, playerName: player.user.username, guess})
  }

  const handlePokemon = (pokemon) => {
    if (room.gameInfo.status !== PLAYING) return;

    switch (room.gameInfo.stage) {
      case SELECT_POKEMON: {
        if (room[playerTeam].selectedCards.length > 4) return;
        if (socket) socket.emit('selectPokemon', {roomId: room.roomData.roomOwner, playerTeam, pokemon: pokemon.name})
        break;
      } case GUESS: {
        handleGuessing(pokemon.name)
        break;
      } default: {
        break;
      }
    }
  }

  const handleQuestion = (e, question, setQuestion) => {
    if (e.key !== 'Enter') return;
    if (socket) socket.emit('createQuestion', {roomId: room.roomData.roomOwner, playerTeam: playerTeam, question})
    setQuestion('')
  }

  const handleAnswer = (question, answer) => {
    if (socket) socket.emit('answerQuestion', {roomId: room.roomData.roomOwner, team: enemyTeam, question, answer}) 
  }

  const handleRestart = () => {
    if (socket) socket.emit('restartGame', {roomId: room.roomData.roomOwner})
  }

  const handleGameInfoState = () => {
    switch (room.gameInfo.status) {
      case INITIAL:
        return <GameInicialization 
                  room={room} 
                  player={player} 
                  handleGameCards={handleGameCards} 
                  handleGameRounds={handleGameRounds} 
                  handleGameStart={handleGameStart}
                />;
      case PLAYING:
        return <GameRunning 
                room={room} 
                playerTeam={playerTeam} 
                enemyTeam={enemyTeam} 
                handleQuestion={handleQuestion} 
                handleAnswer={handleAnswer}
                handleGuessing={handleGuessing}
              />
      case FINISHED:
        return (
        <div className='cool'>
          Partida Finalizada! <br/>
          {room.yellowTeam.score === room.blueTeam.score 
          ? `A partida terminou empatada!`
          : room.blueTeam.score > room.yellowTeam.score ? `O time azul venceu!`:`O time amarelo venceu!`
          }<br/>
          Jogar novamente? <br/><button className='cool btn'onClick={handleRestart}>Reiniciar partida</button>
        </div>)
      default:
        break;
    }
  }

  useEffect(() => {
    if (!player) return;

    socket = io(ENDPOINT, {transports: ["websocket", "polling"]})

    socket.emit('join', player.user.username);

    socket.on('newStateRoom', (newRoom) => setRoom(newRoom))

    socket.on('userAlreadyOnline', () => setAccountAlreadyInUse(true))

    return () => {socket.disconnect()}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player])
  
  useEffect(() => {
    if (!player || !room) return;

    const blueTeamPlayers = room.blueTeam.players.map((p) => p.playerName)
  
    if (blueTeamPlayers.includes(player.user.username)) {
      setPlayerTeam(BLUE_TEAM)
      setEnemyTeam(YELLOW_TEAM)
    } else {
      setPlayerTeam(YELLOW_TEAM)
      setEnemyTeam(BLUE_TEAM)
    }
  }, [room, player])

  if (!player) return <div className="RoomContainer">Rota não autorizada.</div>;
  if (accountAlreadyInUse) return <div className="RoomContainer">Conta já está sendo utilizada!</div>;

  return (
  <div className="RoomContainer">
    {room && player && (
    <>
    <div className="players">
      <div className="blueTeam">
        {room.blueTeam.players.map((player) => (
          <div key={player.playerName}>
            <img height='40px' src={`https://robohash.org/${player.playerName}?set=set4`} alt="avatar"/>
          </div>
        ))}
      </div>
      <div className="yellowTeam">
        {room.yellowTeam.players.map((player) => (
          <div key={player.playerName}>
            <img height='40px' src={`https://robohash.org/${player.playerName}?set=set4`} alt="avatar"/>
          </div>
        ))}
      </div>
    </div>
    <div className="board">
      <div className='renderCards'>
      {room.gameCards.length !== 25 
        ? <div className='cool' style={{textAlign: 'center'}}>
            Jogo inspirado no joguinho Adivinha Quem <hr /> 
            Nesse jogo cada uma das equipes escolhe um pokemon e tenta adivinhar o pokemon escolhido
            pela equipe adversária. <hr />
            No início da partida o dono da sala deve escolher uma cartela de pokemons inserindo um valor de 1 a 32
            e pressionando Enter para submeter a escolha. Fazendo o mesmo para escolher a quantidade de rodadas.<br/>
            Por fim o jogador deve iniciar uma partida. A partida é iniciada se tiver ao menos um jogador em cada equipe.<hr/>
            No início da rodada ambas as equipes devem selecionar de 1 até N pokemons para um ser escolhido, onde N = Tamanho da equipe. <hr/>
            Depois do pokemon ser escolhido, cada equipe deve fazer três perguntas que devem ser respondidas
            de forma imediata pela equipe adversária{` (sempre espere a sua pergunta atual ser respondida para fazer uma nova
            e ter mais chance de acertar o pokemon da equipe adversária)`}. <hr/>
            Após ambas as equipes terem feito suas perguntas, cada integrante da equipe pode escolher um pokemon e, caso alguém acerte,
            a equipe pontua. <hr/>
            Considerações finais: JOGUINHO FEITO PARA APRENDER UMA TECNOLOGIA NOVA.
            NÃO HOUVE UMA ESTRUTURAÇÃO IDEAL PARA ESSE PROJETO E FOI FEITO NO "FREESTYLE" E POR DIVERSÃO.
          </div> 
        : room.gameCards.map((pokemon) => <Pokemon handlePokemon={handlePokemon} pokemon={pokemon} key={pokemon.id}/>)
      }
      </div>
      <div className="cool roundsStatus">Rodadas: {room.gameInfo.currentRound}/{room.gameInfo.rounds}</div>
    </div>
    <div className="gameInteraction">
      <div className="gameInfo">
        <div style={{display: 'flex'}}>
          <div className='cool info' title={`Sala ID: ${room.roomData.roomOwner}`}>
            Sala ID: {room.roomData.roomOwner}
          </div>
          <div className='cool'>
            Entrar na sala:{' '}
            <input 
              type='text' 
              className='roomIdInput' 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
          <button className='cool btn' onClick={handleRoomAccess}>
            ENTRAR
          </button>
        </div>
        {handleGameInfoState()}
      </div>
      <div className="chat">
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <div className='cool'>Pokemon Escolhido: {room[playerTeam].pokemon}</div>
          <div className='cool' style={{display: 'flex'}}>
            Placar: <span style={{borderBottom: '4px solid #0075BE', margin: '0 5px'}}>{` ${room.blueTeam.score} `}</span> 
            x <span style={{borderBottom: '4px solid #D5A100', margin: '0 5px'}}>{` ${room.yellowTeam.score} `}</span>
          </div>
        </div>
       {room.gameInfo.status === PLAYING && room.gameInfo.stage === ANSWER_QUESTION && (
        <>
          <h5 className='cool'>Perguntas feitas:</h5>
          {room[playerTeam].questions.map((question, index) => <div key={index} className='cool'>{question.question}</div>)}
        </>)}
        {room.gameInfo.status === PLAYING && room.gameInfo.stage === GUESS && (
        <>
          <h5 className='cool'>Votos da equipe:</h5>
          <div className='cool' style={{display: 'flex'}}>
            {room[playerTeam].players.map((player) => (
              <h6 className='cool' key={player.playerName}>
                {player.playerName}: {player.playerGuess || 'Não votou.'}
              </h6>
            ))}
          </div>
        </>)}
        {room.gameInfo.status === PLAYING && room.gameInfo.stage === QUESTION_PHASE && (
        <div style={{ width: '100%', overflow: 'auto'}}>
          <h5 className='cool'>Responda as perguntas sobre o pokemon escolhido!</h5>
            {room[enemyTeam].questions.map((question, index) => (
            <div key={index} className='cool' style={{display: 'flex', flex: 1, justifyContent: 'space-between'}}>
              <div style={{ overflow: 'auto'}}>{question.question}</div>
              <div style={{width: '100px', minWidth: '100px'}}>
                <button 
                  className='cool btn answerQuestionBtns'
                  style={{color: question.answer === YES ? 'green' : 'black'}}
                  onClick={() => handleAnswer(index, YES)}
                >
                  Sim
                </button>
                <button 
                  className='cool btn answerQuestionBtns'
                  style={{color: question.answer === NO ? 'green' : 'black'}}
                  onClick={() => handleAnswer(index, NO)}
                >
                  Não
                </button>
                <button 
                  className='cool btn answerQuestionBtns'
                  title="Pergunta imprópria"
                  style={{color: question.answer === INAPPROPRIATE ? 'green' : 'black'}}
                  onClick={() => handleAnswer(index, INAPPROPRIATE)}
                >
                  Imp
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
        {room.gameInfo.status !== INITIAL && room.gameInfo.stage === SELECT_POKEMON && (
        <>
          <h5 className='cool'>Mensagem da sala:</h5>
          <div className='cool'>
            {room.gameInfo.message.length > 0 && room.gameInfo.message}
          </div>
        </>)}
      </div>
    </div>
    </>)}
  </div>
  )
};

export default Room;