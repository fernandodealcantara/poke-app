import './styles.css';
import pokeGuessImage from '../../images/poke-guess.png'

const Header = ({user, room}) => {
  return (
  <div className="header">
    <img className="logo" src={pokeGuessImage} alt="Poke Guess Logo" />
    Usuário: {user} | Sala: {room}
  </div>)
}

export default Header;
