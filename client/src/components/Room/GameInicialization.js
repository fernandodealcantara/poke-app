const GameInicialization = ({room, player, handleGameCards, handleGameRounds, handleGameStart}) => (
  <div className='initialGame'>
  {room.roomData.roomOwner === player.user.username ? 
    <>
      <div className='cool' title='Pressione Enter para confirmar o valor informado!'>
        Selecione uma cartela de 1 a 32:{' '}
        <input type='number' min={1} max={32} defaultValue={1} onKeyPress={handleGameCards}/>
      </div>
      <div className='cool' title='Pressione Enter para confirmar o valor informado!'>
        Quantidade de rodadas 1 a 5:{' '}
        <input type='number' min={1} max={5} defaultValue={1} onKeyPress={handleGameRounds}/>
      </div>
      <button className='cool btn' style={{marginTop: '10px'}} onClick={handleGameStart}>
        INICIAR PARTIDA
      </button>
    </>
    : <div className='cool'>
      Aguarde enquanto o dono da sala configura a partida.
      </div>
  }
  </div>
)

export default GameInicialization;