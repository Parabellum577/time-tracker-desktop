import * as React from 'react'
import * as trackersActions from '@store/trackers/actions'
import * as alertActions from '@store/alerts/actions'

import { updateCacheByTrackersIDArray } from '../helpers'
import { useDispatch } from 'react-redux'
import api from '@services/api'
import { push } from 'connected-react-router'
import { MainContext } from '@Routers'
import useShallowEqualSelector from '@services/useShallowEqualSelector'

const styles = require('../styles.module.scss')
const removeStyles = require('./remove.module.scss')

interface IOwnProps {
  TrackerID: number
}

const RemoveTracker: React.FC<IOwnProps> = props => {
  const { TrackerID } = props
  const dispatch = useDispatch()
  const context = React.useContext(MainContext)
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const isUserHaveOneIntegration = userTrackers.length < 3

  const deleteTracker = React.useCallback(
    trackerID => {
      const action = trackersActions.removeUserTracker(trackerID)
      dispatch(action)
    },
    [dispatch],
  )

  const showAlert = React.useCallback(
    alert => {
      const action = alertActions.showAlertMessage.request(alert)
      dispatch(action)
    },
    [dispatch],
  )

  const redirect = React.useCallback(
    path => {
      const action = push(path)
      dispatch(action)
    },
    [dispatch],
  )

  const removeIntegration = async () => {
    try {
      api.tracker.DeleteUserTrackerCredentials({ TrackerID })

      deleteTracker(TrackerID)

      updateCacheByTrackersIDArray(TrackerID)

      redirectAndClearContext()

      showAlert({
        alertType: 'success',
        alertMessage: 'Integration successfully removed',
      })
    } catch (error) {
      console.error(error)
      showAlert({ alertType: 'error', alertMessage: error.message })
    }
  }

  const redirectAndClearContext = () => {
    context.clearContext()
    if (isUserHaveOneIntegration) {
      redirect('/main/addTrackers/')
    } else {
      redirect('/main/userTrackers/')
    }
  }

  return (
    <button type="button" className={removeStyles.removeIntegrationBtn} onClick={removeIntegration}>
      Remove Integration
    </button>
  )
}

export default React.memo(RemoveTracker)
