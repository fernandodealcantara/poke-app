import React, {useState} from 'react';

const SELECT_POKEMON = 1;
const QUESTION_PHASE = 2.1;
const GUESS = 4;

const YES = 1;
const NO = 2;
const INAPPROPRIATE = 3;

const NO_VOTE = 'isento';

const GameRunning = ({room, playerTeam, handleQuestion, handleGuessing}) => {
  const [question, setQuestion] = useState('')

  return (
  <div className='initialGame'>
    {(() => {
      switch (room.gameInfo.stage) {
        case SELECT_POKEMON:{
          return (
          <>
            <div className="cool">Selecione um pokemon!</div>
            <div className="cool">Pokemons selecionados pela equipe:<br/>
              {room[playerTeam].selectedCards.map((card) => ` ${card} `)}
            </div>
          </>
          );
        } case QUESTION_PHASE: {
          return (
            <>
              <div style={{ width: '100%'}}>
                <h5 className='cool'>Faça 3 perguntas para a outra equipe!</h5>
                {room[playerTeam].questions.map((question, index) => (
                  <div key={index} className='cool' style={{display: 'flex', flex: 1, justifyContent: 'space-between'}}>
                    <div style={{ overflow: 'auto'}}>{question.question}</div>
                    <div style={{ minWidth: '35px'}}>
                      <div 
                        className='cool btn answerQuestionBtns'
                        style={{display: question.answer === YES ? 'block' : 'none'}}
                      >
                        Sim
                      </div>
                      <div 
                        className='cool btn answerQuestionBtns'
                        style={{display: question.answer === NO ? 'block' : 'none'}}
                      >
                        Não
                      </div>
                      <div 
                        className='cool btn answerQuestionBtns'
                        title="Pergunta imprópria"
                        style={{display: question.answer === INAPPROPRIATE ? 'block' : 'none'}}
                      >
                        Imp
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {room[playerTeam].questions.length < 3
                && <div className='cool' title='Pressione Enter para enviar a questão!'>
                    Pergunta:{' '}
                    <input 
                      type='text'
                      maxLength={30}
                      className='roomIdInput questionInput'
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)} 
                      onKeyPress={(e) => handleQuestion(e, question, setQuestion)}
                    />
                </div>
              }
            </>
          );
        } case GUESS: {
          return (
            <div style={{ width: '100%'}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h5 className='cool'>Respostas recebidas. Escolha um pokemon ou se isente!</h5>
                <button className='cool btn' onClick={() => handleGuessing(NO_VOTE)}>Não votar</button>
              </div>
              {room[playerTeam].questions.map((question, index) => (
                <div key={index} className='cool' style={{display: 'flex', flex: 1, justifyContent: 'space-between'}}>
                  <div style={{ overflow: 'auto'}}>{question.question}</div>
                  <div style={{ minWidth: '35px'}}>
                    <div 
                      className='cool btn answerQuestionBtns'
                      style={{display: question.answer === YES ? 'block' : 'none'}}
                    >
                      Sim
                    </div>
                    <div 
                      className='cool btn answerQuestionBtns'
                      style={{display: question.answer === NO ? 'block' : 'none'}}
                    >
                      Não
                    </div>
                    <div 
                      className='cool btn answerQuestionBtns'
                      title="Pergunta imprópria"
                      style={{display: question.answer === INAPPROPRIATE ? 'block' : 'none'}}
                    >
                      Imp
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        } default: {
          return <div>Not covered</div>
        }
      }
    })()}
  </div>
  )
}

export default GameRunning;