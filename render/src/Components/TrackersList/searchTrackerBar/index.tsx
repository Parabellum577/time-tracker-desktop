import * as React from 'react'
import * as _ from 'lodash'
import * as alertActions from '@store/alerts/actions'

import { push } from 'connected-react-router'
import { useDebouncedCallback } from 'use-debounce/lib'
import { ALL_SUPPORTED_TRACKERS } from '@services/helpers'
import { MainContext } from '@Routers'
import { useDispatch } from 'react-redux'

const styles = require('./search-tracker-bar.module.scss')

const SearchTrackerBar: React.FC = props => {
  const context = React.useContext(MainContext)
  const [inputValue, setInputValue] = React.useState('')
  const supportedTrackerTypes = ALL_SUPPORTED_TRACKERS.map(tracker => tracker.Type)

  const dispatch = useDispatch()

  const routeToAddTracker = React.useCallback(
    path => {
      const action = push(path)
      dispatch(action)
    },
    [dispatch],
  )

  const showAlert = React.useCallback(
    msg => {
      const action = alertActions.showAlertMessage.request(msg)
      dispatch(action)
    },
    [dispatch],
  )

  const [fetchInputValue] = useDebouncedCallback(() => {
    const isWeHaveTracker = supportedTrackerTypes.find(tracker => tracker === inputValue)

    if (isWeHaveTracker) {
      context.setTrackerType(isWeHaveTracker)
      routeToAddTracker('/main/editTracker/:tracker')
      setInputValue('')
    } else {
      showAlert({ alertType: 'warning', alertMessage: 'Pls, set correct tracker name' })
    }
  }, 1000)

  const handleChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()

    if (value.length) {
      setInputValue(value)
      fetchInputValue()
    }
  }

  return (
    <div className={styles.trackersSearch}>
      <input placeholder="Paste Tracker Name" onChange={handleChangeUrl} />
    </div>
  )
}

export default React.memo(SearchTrackerBar)
