// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=0&longitude=0"

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import styles from './Form.module.css'
import Button from './Button'
import BackButton from './BackButton'
import Message from './Message'
import Spinner from './Spinner'
import { useUrlPosition } from '../hooks/useUrlPosition'
import { useCities } from '../contexts/CitiesContext'

const baseURL = 'https://api.bigdatacloud.net/data/reverse-geocode-client'

export function convertToEmoji(countryCode) {
  const codePoints = countryCode.toLowerCase()
  return codePoints
}

function Form() {
  const navigate = useNavigate()
  const [lat, lng] = useUrlPosition()
  const { createCity, isLoading } = useCities()

  const [isLoadingGeocoding, setIsLoadingGeocoding] = useState(false)
  const [cityName, setCityName] = useState('')
  const [country, setCountry] = useState('')
  const [date, setDate] = useState(new Date())
  const [notes, setNotes] = useState('')
  const [emoji, setEmoji] = useState('')
  const [geocodingError, setGeocodingError] = useState('')

  useEffect(() => {
    if (!lat && !lng) return
    async function fetchCityData() {
      try {
        setIsLoadingGeocoding(true)
        setGeocodingError('')
        const res = await fetch(`${baseURL}?latitude=${lat}&longitude=${lng}`)
        const data = await res.json()
        if (!data.countryCode)
          throw new Error(
            'That does not seem to be a city. Click somewhere else'
          )
        setCityName(data.city || data.locality || '')
        setCountry(data.countryName)
        setEmoji(convertToEmoji(data.countryCode))
      } catch (e) {
        setGeocodingError(e.message)
      } finally {
        setIsLoadingGeocoding(false)
      }
    }
    fetchCityData()
  }, [lat, lng])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!cityName || !date) return
    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: { lat, lng },
    }
    await createCity(newCity)
    navigate('/app/cities')
  }

  if (!lat && !lng)
    return <Message message="Start by clicking some where in the map" />

  if (isLoadingGeocoding) return <Spinner />

  if (geocodingError) return <Message message={geocodingError} />

  return (
    <form
      className={`${styles.form} ${isLoading ? styles.loading : ''}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => setDate(date)}
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <Button type="primary">Add</Button>
        <BackButton />
      </div>
    </form>
  )
}

export default Form
