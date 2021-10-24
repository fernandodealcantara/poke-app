import React, { useEffect, useState, useRef } from "react";
import "./styles.css";
import Pokemon from "../Card/Pokemon.js";
import {
  getAllPokemonsFromAllPages,
  postUserFavPokemons,
  delFromUserFavPokemons,
} from "../../api/pokedex.js";
import { AutoSizer, List } from "react-virtualized";
import "react-virtualized/styles.css"; // only needs to be imported once

const Home = ({ player, setPlayer }) => {
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [userPokemons, setUserPokemons] = useState([]);
  const [display, setDisplay] = useState(false);
  const favPokes = useRef(null);
  const [search, setSearch] = useState("");
  const ITEMS_COUNT = filteredPokemons.length;
  const ITEM_SIZE = 180;

  const onWheel = (e) => (favPokes.current.scrollLeft += e.deltaY);

  const fetchAllPokemons = async () => {
    const { data, error } = await getAllPokemonsFromAllPages(1, 33);
    if (error) return;
    setAllPokemons(data);
  };

  const handleAddFavoritePokemons = async (pokemon) => {
    if (player) {
      const { data, error } = await postUserFavPokemons(
        player.user.username,
        pokemon.name
      );

      if (error) return;

      setPlayer(data);
    }
  };

  const handleRemFavoritePokemons = async (pokemon) => {
    if (player) {
      const { data, error } = await delFromUserFavPokemons(
        player.user.username,
        pokemon.name
      );

      if (error) return;

      setPlayer(data);
    }
  };

  useEffect(() => {
    const userPokemonsIds = userPokemons.map((pokemon) => pokemon.id);
    const TodosPokemons = allPokemons
      .filter((pokemon) => pokemon.name.includes(search.toLowerCase()))
      .filter((pokemon) => !userPokemonsIds.includes(pokemon.id));
    setFilteredPokemons(TodosPokemons);
  }, [allPokemons, search, userPokemons]);

  useEffect(() => {
    fetchAllPokemons();
  }, []);

  useEffect(() => {
    if (player) {
      setUserPokemons(player.pokemons);
    } else {
      setUserPokemons([]);
    }
  }, [player]);

  return (
    <div className="Container">
      <div
        style={{ borderRadius: display ? "10px 10px 0px 0px" : "10px" }}
        className="buttonDiv"
      >
        <button
          style={{ display: player ? "block" : "none" }}
          className="button"
          onClick={() => setDisplay(!display)}
        >
          Meus Pokemons
        </button>
      </div>
      <div
        ref={favPokes}
        onWheel={onWheel}
        style={{ display: display && player ? "flex" : "none" }}
        className="favoritePokemons"
      >
        {userPokemons.map((pokemon) => (
          <Pokemon
            handlePokemon={handleRemFavoritePokemons}
            useDelete
            key={pokemon.id}
            pokemon={pokemon}
          />
        ))}
        ,
      </div>
      <div className="allPokemons">
        <AutoSizer>
          {({ height, width }) => {
            const itemsPerRow = Math.floor(width / ITEM_SIZE);
            const rowCount = Math.ceil(ITEMS_COUNT / itemsPerRow);

            return (
              <List
                className="List"
                width={width}
                height={height}
                rowCount={rowCount}
                rowHeight={ITEM_SIZE}
                rowRenderer={({ index, key, style }) => {
                  const items = [];
                  const fromIndex = index * itemsPerRow;
                  const toIndex = Math.min(
                    fromIndex + itemsPerRow,
                    ITEMS_COUNT
                  );
                  for (let i = fromIndex; i < toIndex; i++) {
                    items.push(
                      <Pokemon
                        handlePokemon={handleAddFavoritePokemons}
                        pokemon={filteredPokemons[i]}
                        key={i}
                      />
                    );
                  }
                  return (
                    <div className="Row" key={key} style={style}>
                      {items}
                    </div>
                  );
                }}
              />
            );
          }}
        </AutoSizer>
      </div>
      <div className="searchBar">
        <input
          type="text"
          className="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Home;
