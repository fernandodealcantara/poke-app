import './styles.css';

const Pokemon = ({handlePokemon, pokemon, useDelete}) => {
    return (
      <div className="PokemonCard">
        <div className="Pokemon" onClick={() => handlePokemon(pokemon)} style={{ backgroundImage: `url(${pokemon?.image_url})`}}>
          {useDelete ? <span className="RemoveFavorite"/> : <span className="Pokeball"/>}
        </div>
        <div className="PokemonName">
         <p>{pokemon.name}<br/>
         {pokemon.kind.replace(";"," & ")}</p>
        </div>
      </div>
    )
}

export default Pokemon;