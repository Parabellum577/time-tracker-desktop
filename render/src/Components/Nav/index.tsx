import * as React from 'react'
import * as authActions from '@store/auth/actions'
import * as screenshotActions from '@store/screenshot/actions'
import * as _ from 'lodash'

import useShallowEqualSelector from '@services/useShallowEqualSelector'
import IconWrapper from '@components/IconWrapper'
import Switcher from './Switcher'
import api from '@services/api'

import { openExternal } from '@services/openWindow'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'

const styles = require('./styles.module.scss')

type NavItemTitles = 'Preferences' | 'Integrations' | 'Screenshots' | 'Web Dashboard' | 'Help' | 'Log Out'

type NavItemLinks =
  | '/main/preferences'
  | '/main/addTrackers'
  | '/main/userTrackers'
  | '/main/screenshot'
  | '/main/help'
  | ''

type NavItemIcons = 'menuSettings' | 'menuSupercharge' | 'menuCamera' | 'menuDashboard' | 'menuInfo' | 'menuLogout'

interface IMenuItems {
  title: NavItemTitles
  link: NavItemLinks
  iconName: NavItemIcons
  clickHandler?: () => void
  hasErrorWithTracker?: boolean
  hasSwitcher?: boolean
}

const Nav: React.FC = props => {
  const dispatch = useDispatch()
  const navElRef = React.useRef(null)
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const currentUser = useShallowEqualSelector(state => state.user.currentUser)
  const isUserTrackersArrEmpty = _.isEmpty(userTrackers.filter(item => item.Type !== 'TGTRACKER'))

  const [isNavOpen, setNavOpen] = React.useState(false)

  const hasErrorTracker = userTrackers.some(item => !item.Status)

  const logout = React.useCallback(() => {
    const action = authActions.signOut()
    dispatch(action)
  }, [dispatch])

  React.useEffect(() => {
    document.addEventListener<any>('click', detectOutClick)
    return () => {
      document.removeEventListener<any>('click', detectOutClick)
    }
  }, [isNavOpen])

  const detectOutClick = (e: React.MouseEvent) => {
    if (navElRef.current && !navElRef.current.contains(e.target) && isNavOpen) {
      setNavOpen(false)
    }
  }

  const menuItems: IMenuItems[] = [
    {
      title: 'Preferences',
      link: '/main/preferences',
      iconName: 'menuSettings',
      hasErrorWithTracker: false,
    },
    {
      title: 'Integrations',
      link: isUserTrackersArrEmpty ? '/main/addTrackers' : '/main/userTrackers',
      iconName: 'menuSupercharge',
      hasErrorWithTracker: hasErrorTracker,
    },
    {
      title: 'Screenshots',
      link: '/main/screenshot',
      iconName: 'menuCamera',
      hasErrorWithTracker: false,
      hasSwitcher: true,
    },
    {
      title: 'Web Dashboard',
      link: '',
      iconName: 'menuDashboard',
      clickHandler: () => goToDashBoard(),
      hasErrorWithTracker: false,
    },
    {
      title: 'Help',
      link: '/main/help',
      iconName: 'menuInfo',
      hasErrorWithTracker: false,
    },
    {
      title: 'Log Out',
      link: '',
      iconName: 'menuLogout',
      clickHandler: () => logout(),

      hasErrorWithTracker: false,
    },
  ]

  const goToDashBoard = () => {
    const OTS = api.user.GetOTS()
    const href = `${process.env.REDIRECT_URL}/desktop/login?otscode=${OTS}`
    openExternal(href)
  }

  const navMenuToggle = () => {
    setNavOpen(!isNavOpen)
  }

  return (
    <div className={styles.navWrap}>
      <div className={styles.avatarBlock} onClick={navMenuToggle}>
        <img className={styles.avatar} src={currentUser.Avatar} />
        {hasErrorTracker && <IconWrapper name="errorIcon" classes={styles.errorIcon} />}
      </div>
      {isNavOpen && (
        <nav className={styles.nav} ref={navElRef}>
          <NavLink to={'/main/user'} className={styles.navHead}>
            <div className={styles.avatarBlock}>
              <img className={styles.avatar} src={currentUser.Avatar} />
            </div>
            <div className={styles.userDescriptionBlock}>
              <h3>
                {currentUser.FirstName} {currentUser.LastName}
              </h3>
              <span>Edit Profile</span>
            </div>
            <IconWrapper name="keyboard_arrow_right" classes={styles.menuIcon} />
          </NavLink>
          <ul>
            {menuItems.map(item => {
              return (
                <li key={item.title} onClick={item.clickHandler}>
                  <NavLink key={item.title} to={item.link} onClick={item.clickHandler || null}>
                    <div className={styles.navTitleWrap}>
                      <IconWrapper name={item.iconName} />
                      <h3>{item.title}</h3>
                    </div>
                    {item.hasErrorWithTracker && <IconWrapper name="errorIcon" classes={styles.errorIcon} />}
                    {item.hasSwitcher && <Switcher />}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </div>
  )
}

export default React.memo(Nav)
