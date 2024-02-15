/* eslint-disable react/prop-types */
import { useReducer } from 'react'
import { useCallback } from 'react'
import { useContext } from 'react'
import { createContext, useEffect } from 'react'

const BASE_URL = 'http://localhost:8080'

const CitiesContext = createContext()

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: '',
}

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true }
    case 'cities/loaded':
      return { ...state, isLoading: false, cities: action.payload }
    case 'cities/created':
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      }
    case 'cities/deleted':
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      }
    case 'city/loaded':
      return { ...state, isLoading: false, currentCity: action.payload }
    case 'rejected':
      return { ...state, isLoading: false, error: action.payload }
    default:
      throw new Error('Unknown action type')
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState
  )

  useEffect(() => {
    async function fetchCities() {
      dispatch({ type: 'loading' })
      try {
        const res = await fetch(`${BASE_URL}/cities`)
        const data = await res.json()
        dispatch({ type: 'cities/loaded', payload: data })
      } catch {
        dispatch({ type: 'rejected', payload: 'Error fetch cities' })
      }
    }
    fetchCities()
  }, [])

  const getCity = useCallback(
    async (id) => {
      if (id === currentCity[0]?.id) return
      dispatch({ type: 'loading' })
      try {
        const res = await fetch(`${BASE_URL}/cities?id=${id}`)
        const data = await res.json()
        dispatch({ type: 'city/loaded', payload: data })
      } catch {
        dispatch({ type: 'rejected', payload: 'Error fetch city' })
      }
    },
    [currentCity]
  )

  async function createCity(newCity) {
    dispatch({ type: 'loading' })
    try {
      const res = await fetch(`${BASE_URL}/cities`, {
        method: 'POST',
        body: JSON.stringify(newCity),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      dispatch({ type: 'cities/created', payload: data })
    } catch {
      dispatch({ type: 'rejected', payload: 'Error create city' })
    }
  }

  async function deleteCity(id) {
    dispatch({ type: 'loading' })
    try {
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: 'DELETE',
      })
      dispatch({ type: 'cities/deleted', payload: id })
    } catch {
      dispatch({ type: 'rejected', payload: 'Error delete a city' })
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        isLoading,
        currentCity,
        getCity,
        createCity,
        deleteCity,
        error,
      }}
    >
      {children}
    </CitiesContext.Provider>
  )
}

function useCities() {
  const context = useContext(CitiesContext)
  if (context === undefined)
    throw new Error('Context was used outside of the Provider')
  return context
}

export { CitiesProvider, useCities }
