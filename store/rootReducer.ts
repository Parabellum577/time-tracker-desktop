import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'

import authReducer from './auth/reducer'
import currentUserReducer from './currentUser/reducer'
import { AuthAction } from './auth/types'
import planningsReducer from './plannings/reducer'
import alertsReducer from './alerts/reducer'
import screenshotsReducer from './screenshot/reducer'
import screenshotsElectronReducer from './screenshotingElectron/reducer'
import trackersReducer from './trackers/reducer'
import productivityReducer from './productivity/reducer'
import synchronizationReducer from './synchronization/reducer'
import projectsReducer from './projects/reducer'
import bookmarksReducer from './bookmarks/reducer'
import timelineReducer from './timeline/reducer'
import recentReducer from './recents/reducer'
import internetConnectionReducer from './internetConnection/reducer'
import notificationReducer from './notifications/reducer'
import updaterReducer from './updater/reducer'
import timeTrackerReducer from './timeTracker/reducer'

import history from './history'

export type RootAction = AuthAction

const rootReducer = combineReducers({
  auth: authReducer,
  user: currentUserReducer,
  plannings: planningsReducer,
  trackers: trackersReducer,
  productivity: productivityReducer,
  projects: projectsReducer,
  synchronization: synchronizationReducer,
  bookmarks: bookmarksReducer,
  timeline: timelineReducer,
  recent: recentReducer,
  internetConnection: internetConnectionReducer,
  router: connectRouter(history),
  alerts: alertsReducer,
  screenshots: screenshotsReducer,
  screenshotsCaptures: screenshotsElectronReducer,
  notifications: notificationReducer,
  updates: updaterReducer,
  timeTracker: timeTrackerReducer,
})

export type IRootState = ReturnType<typeof rootReducer>

export default rootReducer
