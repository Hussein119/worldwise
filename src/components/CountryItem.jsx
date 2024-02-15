/* eslint-disable react/prop-types */
import styles from './CountryItem.module.css'
import '/node_modules/flag-icons/css/flag-icons.min.css'

function CountryItem({ country }) {
  let countryName = country.country.split(' ')
  countryName = countryName.slice(0, 2).join(' ')

  return (
    <li className={styles.countryItem}>
      <span className={`fi fi-${country.emoji}`}></span>
      <span>{countryName}</span>
    </li>
  )
}

export default CountryItem
