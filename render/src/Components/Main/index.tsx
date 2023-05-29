import * as React from 'react'
import * as _ from 'lodash'

import { Route } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'

import Header from '@components/Header'
import AddTrackers from '@components/TrackersList/addTrackers'
import UserTrackers from '@components/TrackersList/userTrackers'
import UserSettingsPage from '@components/UserSettingsPage/index'
import ScreenshotsPage from '@components/ScreenshotsPage'
import AnimeWrapper from '@components/AnimeWrapper'
import PlanningsPage from '@components/PlanningsPage'
import Preferences from '@components/Preferences'
import ModalTemplate from '@components/ModalTemplate'
import SearchBar from '@components/SearchBar'
import SyncModal from '@components/SyncModal'
import Tutorial from '@components/Tutorial'
import Help from '@components/Help'
import TrackerManipulation from '@components/TrackerManipulation'
import './animations.scss'
import SpinnerPage from '@components/SpinnerPage'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { setAnalyticsView } from '@services/analytics'

const styles = require('./styles.module.scss')

const routes = [
  {
    path: '/main/user',
    Component: AnimeWrapper({
      title: 'Profile',
      component: UserSettingsPage,
    }),
  },
  {
    path: '/main/preferences',
    Component: AnimeWrapper({
      title: 'Preferences',
      component: Preferences,
    }),
  },
  {
    path: '/main/userTrackers',
    Component: AnimeWrapper({
      title: 'Integrations',
      component: UserTrackers,
      isRedirectToMain: true,
    }),
  },
  {
    path: '/main/screenshot',
    Component: AnimeWrapper({
      title: 'Screenshots',
      component: ScreenshotsPage,
    }),
  },
  {
    path: '/main/help',
    Component: AnimeWrapper({
      title: 'Help',
      component: Help,
    }),
  },
  {
    path: '/main/searchTask',
    Component: AnimeWrapper({
      withoutHeader: true,
      component: SearchBar,
    }),
  },
  {
    path: '/main/addTracker/:tracker',
    Component: AnimeWrapper({
      component: TrackerManipulation,
    }),
  },
  {
    path: '/main/editTracker/:tracker',
    Component: AnimeWrapper({
      component: TrackerManipulation,
    }),
  },
]

const Main: React.FC = () => {
  const isLoadingData = useShallowEqualSelector(state => state.auth.isLoadingData)
  const isMaster = useShallowEqualSelector(state => state.synchronization.isMaster)
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const isEmptyUserTrackers = _.isEmpty(userTrackers.filter(tracker => tracker.Type !== 'TGTRACKER'))

  React.useEffect(() => {
    if (isLoadingData) {
      setAnalyticsView('MainLoading')
    } else {
      setAnalyticsView('Main')
    }
  }, [isLoadingData])

  const TrackerManipulationComponents = [
    {
      path: '/main/addTrackers',
      Component: AnimeWrapper({
        title: 'New Integration',
        component: AddTrackers,
        isReturnButton: !isEmptyUserTrackers,
        isRedirectToMain: isEmptyUserTrackers,
      }),
    },
  ]

  return (
    <section className={styles.content}>
      <Tutorial />
      <Header />
      <div className={styles.body}>
        <PlanningsPage />
        {routes.concat(TrackerManipulationComponents).map(({ path, Component }) => (
          <div key={path} data-path={path}>
            <Route exact={true} path={path}>
              {({ match }: { match: boolean }) => (
                <CSSTransition in={match !== null} timeout={1000} classNames="page" unmountOnExit={true}>
                  <Component />
                </CSSTransition>
              )}
            </Route>
          </div>
        ))}
      </div>
      <ModalTemplate visible={!isMaster}>
        <SyncModal />
      </ModalTemplate>
    </section>
  )
}

export default React.memo(Main)
