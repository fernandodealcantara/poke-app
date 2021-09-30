import React, { useEffect, useState } from 'react';
import './styles.css';
import Pokemon  from '../Card/Pokemon.js';
import { getPokemons, postUserFavPokemons, delFromUserFavPokemons } from '../../api/pokedex.js';

const Home = ({ player, setPlayer }) => {
  const [allPokemons, setAllPokemons] = useState([]);
  const [userPokemons, setUserPokemons] = useState([]);
  const [pageInfo, setPageInfo] = useState(undefined);
  const [page, setPage] = useState(1);
  const [display, setDisplay] = useState(false)

  const goBack = () => { if (pageInfo?.prev_page) setPage(pageInfo?.prev_page)}
  const goNext = () => { if (pageInfo?.next_page) setPage(pageInfo?.next_page)}

  const fetchPokemons = async () => {
    const {data, size, next_page, prev_page, error} = await getPokemons(page);
    if (error) return;
    const userPokemonsIds = userPokemons.map((pokemon) => pokemon.id)
    setAllPokemons(data.filter((pokemon) => !userPokemonsIds.includes(pokemon.id)));
    setPageInfo({size, next_page, prev_page});
  }

  const handleAddFavoritePokemons = async (pokemon) => {
    if (player) {
      const {data, error} = await postUserFavPokemons(player.user.username, pokemon.name)
      
      if (error) return;

      setPlayer(data)
    }
  }

  const handleRemFavoritePokemons = async (pokemon) => {
    if (player) {
      const {data, error} = await delFromUserFavPokemons(player.user.username, pokemon.name)

      if (error) return;

      setPlayer(data)
    }
  }

  useEffect(() => {
    fetchPokemons()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userPokemons, page])

  useEffect(() => {
    if (player) {
      setUserPokemons(player.pokemons)
    } else {
      setUserPokemons([])
    }
  }, [player])

  return (
    <div className="Container">
      <button style={{ display: player ? "block" : "none"}} className="button" onClick={() => setDisplay(!display)}>
        Meus Pokemons
      </button>
      <div style={{ display: display && player ? "flex" : "none" }} className="favoritePokemons">
          {userPokemons.map((pokemon) => <Pokemon handlePokemon={handleRemFavoritePokemons} useDelete key={pokemon.id} pokemon={pokemon}/>)}
      </div>
      <div className="allPokemons">
        {allPokemons.map((pokemon) => <Pokemon handlePokemon={handleAddFavoritePokemons} pokemon={pokemon} key={pokemon.id} />)}
      </div>
      <div className='changePages'>
        <button className='button pageButtons' onClick={goBack}>Voltar</button>
        <button className='button pageButtons' onClick={goNext}>Avançar</button>
      </div>
    </div>
  )
}

export default Home;
