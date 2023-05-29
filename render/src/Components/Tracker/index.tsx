import * as React from 'react'
import * as _ from 'lodash'
import { MainContext } from '@Routers'
import classNames from 'classnames'
import { ITrackerWithStatus } from '@types'
import IconWrapper from '@components/IconWrapper'
import { NavLink } from 'react-router-dom'
import { ITrackerToRender } from '@store/trackers/types'
import { ALL_SUPPORTED_TRACKERS } from '@services/helpers'
import useShallowEqualSelector from '@services/useShallowEqualSelector'

const styles = require('./tracker.module.scss')

interface ITrackerProps {
  tracker: ITrackerWithStatus | ITrackerToRender
  class?: string
}

const Tracker: React.FC<ITrackerProps> = props => {
  const context = React.useContext(MainContext)
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const chosenSupportedTracker = ALL_SUPPORTED_TRACKERS.find(tracker => tracker.Type === props.tracker.Type)
  const chosenTracker = userTrackers.find(tracker => tracker.Type === props.tracker.Type)
  const trackerStatus = _.get(chosenTracker, 'Status', true)
  const trackerTitle = _.get(chosenSupportedTracker, 'Name', '')

  const setTrackerTypeToContext = () => {
    context.setTrackerType(props.tracker.Type)
  }

  const errorBlock = () => {
    return (
      !trackerStatus && (
        <div className={styles.errorBlock}>
          <IconWrapper name="errorIcon" classes={styles.errorIcon} />
          <span>connection error</span>
        </div>
      )
    )
  }

  const userEmailBlock = () => {
    return (
      'TrackerUserMail' in props.tracker && <span className={styles.userMail}>{props.tracker.TrackerUserMail}</span>
    )
  }

  const trackerWithNumberBlock = () => {
    return 'Number' in props.tracker && <div className={styles.integrationWithNumber}>{props.tracker.Number}</div>
  }

  return (
    <NavLink
      to={`/main/editTracker/:tracker`}
      className={classNames(styles.trackerBlock, props.class, {
        [styles.trackerBlockActive]: chosenTracker,
        [styles.trackerBlockError]: !trackerStatus,
      })}
      onClick={setTrackerTypeToContext}
    >
      <div className={styles.trackerInfo}>
        <IconWrapper name={props.tracker.Type} classes={styles.trackerLogo} />
        {trackerWithNumberBlock()}
        <div className={styles.mainBlock}>
          <h3 className={styles.url}>{trackerTitle}</h3>

          {errorBlock()}
          {userEmailBlock()}
        </div>
      </div>
      <IconWrapper classes={styles.iconEdit} name="editIcon" />
    </NavLink>
  )
}

export default React.memo(Tracker)
