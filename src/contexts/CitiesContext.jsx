/* eslint-disable react/prop-types */
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from 'react'
import { v4 as uuidv4 } from 'uuid'

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
        const storedCities = JSON.parse(localStorage.getItem('cities')) || []
        dispatch({ type: 'cities/loaded', payload: storedCities })
      } catch {
        dispatch({
          type: 'rejected',
          payload: 'Error fetching cities from storage',
        })
      }
    }
    fetchCities()
  }, [])

  const updateStorage = (citiesData) => {
    localStorage.setItem('cities', JSON.stringify(citiesData))
  }

  const getCity = useCallback(
    async (id) => {
      if (id === currentCity[0]?.id) return
      dispatch({ type: 'loading' })
      try {
        const city = cities.find((city) => city.id === id)
        dispatch({ type: 'city/loaded', payload: city })
      } catch {
        dispatch({ type: 'rejected', payload: 'Error fetch city' })
      }
    },
    [currentCity, cities]
  )

  const createCity = async (newCity) => {
    const cityWithId = { ...newCity, id: uuidv4() }
    dispatch({ type: 'cities/created', payload: cityWithId })
    updateStorage([...cities, cityWithId])
  }

  const deleteCity = async (id) => {
    dispatch({ type: 'cities/deleted', payload: id })
    updateStorage(cities.filter((city) => city.id !== id))
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
    throw new Error('useCities must be used within a CitiesProvider')
  return context
}

export { CitiesProvider, useCities }
