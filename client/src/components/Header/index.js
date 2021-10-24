import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import "./styles.css"
import pokeGuessImage from "../../images/poke-guess.png"
import { getUser } from "../../api/pokedex.js"

const Header = ({ player, setPlayer }) => {
  const location = useLocation().pathname
  const [username, setUsername] = useState("")

  const handleSetUser = async (e) => {
    if (e.key !== "Enter" || username.length === 0) return
    const { user, pokemons, error } = await getUser(username)
    if (error) return
    setPlayer({ user, pokemons })
    setUsername("")
  }

  return (
    <div className={`header ${location === "/room" ? "header-room" : ""}`}>
      <img className="logo" src={pokeGuessImage} alt="Poke Guess Logo" />
      {player ? (
        <span className="user">
          <img
            height="30px"
            src={`https://robohash.org/${player.user.username}?set=set4`}
            alt="My avatar"
            className="avatar"
          />
          <p className="userInfo">{player.user.username}</p>
          <Link to={`/`}>
            <button className="buttonStyle">Home</button>
          </Link>
          <Link to={`/room`}>
            <button className="buttonStyle">Minha sala</button>
          </Link>
          <Link to={`/`}>
            <button className="buttonStyle" onClick={() => setPlayer(undefined)}>
              Sair
            </button>
          </Link>
        </span>
      ) : (
        <input
          className="login"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleSetUser}
        />
      )}
    </div>
  )
}

export default Header
