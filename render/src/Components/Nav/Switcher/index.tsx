import * as React from 'react'
import * as screenshotActions from '@store/screenshot/actions'
import * as alertActions from '@store/alerts/actions'

import classNames from 'classnames'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { useDispatch } from 'react-redux'

const styles = require('./styles.module.scss')

const Switcher: React.FC = () => {
  const dispatch = useDispatch()
  const screenshotStatus = useShallowEqualSelector(state => state.screenshots.status)
  const storageForScreenshot = useShallowEqualSelector(state => state.screenshots.availableStorage)
  const plannings = useShallowEqualSelector(state => state.plannings.openPlannings)
  const coldPlannings = useShallowEqualSelector(state => state.plannings.coldPlannings)
  const isActiveTracking = plannings.concat(coldPlannings).some(p => p.Active)

  const [isScreenshotEnable, setScreenshotEnable] = React.useState(screenshotStatus)

  const showAlert = React.useCallback(
    alert => {
      const action = alertActions.showAlertMessage.request(alert)
      dispatch(action)
    },
    [dispatch],
  )

  const handleScreenshotStatus = React.useCallback(() => {
    const action = screenshotActions.handleScreenshotStatus.request({ newScreenshotStatus: !isScreenshotEnable })
    dispatch(action)
  }, [dispatch, isScreenshotEnable])

  React.useEffect(() => {
    setScreenshotEnable(screenshotStatus)
  }, [screenshotStatus])

  const toggleScreenshot = (e: React.MouseEvent<HTMLLabelElement> | React.ChangeEvent<HTMLInputElement>) => {
    if (!storageForScreenshot) {
      showAlert({
        alertType: 'warning',
        alertMessage: 'Pls, Connect Storage for Screenshots',
      })
      return
    }

    if (isActiveTracking) {
      e.preventDefault()
      e.stopPropagation()
      showAlert({
        alertType: 'warning',
        alertMessage: 'Pls, Stop Tracking for Enable screenshot Switcher',
      })
      return
    }

    e.preventDefault()
    e.stopPropagation()

    handleScreenshotStatus()
  }

  return (
    <label className={styles.switch} onClick={toggleScreenshot}>
      <input type="checkbox" defaultChecked={isScreenshotEnable && !!storageForScreenshot} />
      <span
        className={classNames(styles.slider, isScreenshotEnable && storageForScreenshot ? styles.checked : undefined)}
      />
    </label>
  )
}

export default React.memo(Switcher)
