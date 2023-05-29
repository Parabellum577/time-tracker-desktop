import * as React from 'react'
import { NavLink } from 'react-router-dom'
import classNames from 'classnames'

import { ITrackerWithStatus } from '@types'
import IconWrapper from '@components/IconWrapper'
import { MainContext } from '@Routers'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { ALL_SUPPORTED_TRACKERS } from '@services/helpers'

const styles = require('./styles.module.scss')

interface IHeaderProps {
  title?: string
  closeModalWindow: () => void
  isReturnButton?: boolean
  userTrackers?: ITrackerWithStatus[]
  isModal?: boolean
}

const Header: React.FC<IHeaderProps> = props => {
  const context = React.useContext(MainContext)
  const TrackerType = context.TrackerType
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const chosenUserTracker = userTrackers.find(item => item.Type === TrackerType)
  const isEditTrackerPage = !!chosenUserTracker
  const [trackerName, setTrackerName] = React.useState('')

  React.useEffect(() => {
    const tracker = ALL_SUPPORTED_TRACKERS.find(t => t.Type === TrackerType)
    setTrackerName(tracker ? tracker.Name : TrackerType)
  }, [TrackerType])

  const getTitle = () => {
    return (
      <div className={styles.titleBlock}>
        {TrackerType ? (
          <>
            <IconWrapper name={TrackerType} classes={styles.trackerIcon} />
            <span>{(isEditTrackerPage ? 'Edit ' : 'Connect ') + trackerName}</span>
          </>
        ) : (
          <>
            {props.isReturnButton && (
              <NavLink to="/main/userTrackers" className={styles.link}>
                <IconWrapper name="keyboard_arrow_left" classes={styles.arrowIcon} />
              </NavLink>
            )}
            <p>{props.title}</p>
          </>
        )}
      </div>
    )
  }

  return (
    <div
      className={classNames(styles.header, {
        [styles.modalHeader]: props.isModal,
      })}
    >
      {getTitle()}
      <div
        className={styles.iconContainer}
        onClick={() => {
          props.closeModalWindow()
        }}
      >
        {props.isModal ? (
          <IconWrapper name="iconClose" height="24px" />
        ) : (
          <IconWrapper name="clear" classes={styles.clearIcon} />
        )}
      </div>
    </div>
  )
}

export default React.memo(Header)
