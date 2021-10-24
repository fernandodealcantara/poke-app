import axios from "axios"

const API = axios.create({ baseURL: "https://pokedex20201.herokuapp.com" })

export const getPokemons = async (page) => {
  try {
    const { data } = await API.get(`/pokemons?page=${page}`)
    return data
  } catch (error) {
    return { error: "Error trying to get pokemons." }
  }
}

export const getUser = async (username) => {
  try {
    const { data } = await API.get(`/users/${username}`)
    if (data) return data
  } catch (error) {
    try {
      const { data } = await API.post("/users", { username })
      return { user: data, pokemons: [] }
    } catch (error) {
      return { error: "Error trying to get/create user." }
    }
  }
}

export const postUserFavPokemons = async (username, pokemon) => {
  try {
    const { data } = await API.post(`/users/${username}/starred/${pokemon}`)
    return { data }
  } catch (error) {
    return { error: "Error trying to post favorite pokemon." }
  }
}

export const delFromUserFavPokemons = async (username, pokemon) => {
  try {
    const { data } = await API.delete(`/users/${username}/starred/${pokemon}`)
    return { data }
  } catch (error) {
    return { error: "Error trying to delete favorite pokemon." }
  }
}

export const getPokemon = async (pokemonName) => {
  try {
    const { data } = await API.get(`/pokemons/${pokemonName}`)
    return { data }
  } catch (error) {
    return { error: "Error trying to get pokemon" }
  }
}

function range(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => API.get(`/pokemons?page=${start + idx}`))
}

export const getAllPokemonsFromAllPages = async (pagI, pagF) => {
  try {
    const pages = await Promise.all(range(pagI, pagF))
    const pokemons = pages.map((page) => page.data.data).flat()
    return { data: pokemons }
  } catch (error) {
    return { error: "Error trying to get pokemons." }
  }
}
