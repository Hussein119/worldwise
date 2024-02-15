import { Outlet } from 'react-router-dom'
import styles from './Sidebar.module.css'
import Logo from './Logo'
import AppNav from './AppNav'

function Sidebar() {
  return (
    <div className={styles.sidebar}>
      <Logo />
      <AppNav />

      {/*To handle nested routes*/}
      <Outlet />

      <footer className={styles.footer}>
        <p className={styles.copyright}>
          &copy; Copyright {new Date().getFullYear()} by worldWise Inc.
        </p>
      </footer>
    </div>
  )
}

export default Sidebar
