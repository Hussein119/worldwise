/* eslint-disable react/prop-types */
import styles from './CountryList.module.css'
import Spinner from './Spinner'
import CountryItem from './CountryItem'
import Message from './Message'
import { useCities } from '../contexts/CitiesContext'

function CountryList() {
  const { cities, isLoading } = useCities()
  if (isLoading) return <Spinner />
  if (!cities.length)
    return <Message message="Add your first city by clicking on the map" />

  const countries = cities.reduce((arr, city) => {
    if (!arr.map((el) => el.country).includes(city.country))
      return [...arr, { country: city.country, emoji: city.emoji }]
    else return arr
  }, [])

  return (
    <ul className={styles.countriesList}>
      {countries.map((country, index) => (
        <CountryItem country={country} key={index} />
      ))}
    </ul>
  )
}

export default CountryList
