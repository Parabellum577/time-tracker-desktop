import * as React from 'react'
import * as _ from 'lodash'
import { NavLink } from 'react-router-dom'
import { ITrackerWithStatus } from '@types'
import Tracker from '@components/Tracker'
import useShallowEqualSelector from '@services/useShallowEqualSelector'

const styles = require('./tracker-list.module.scss')

export interface ITrackersState {
  trackersList: ITrackerWithStatus[]
}

const UserTrackers: React.FC = props => {
  const userTrackers = useShallowEqualSelector(state => state.trackers.userTrackers)
  const [trackersList, setTrackersList] = React.useState([])

  React.useEffect(() => {
    setTrackersList(userTrackers)
  }, [userTrackers])

  return (
    <div className={styles.trackerSection}>
      {trackersList
        .filter(tracker => tracker.Type !== 'TGTRACKER')
        .map(tracker => (
          <Tracker key={tracker.Type} tracker={tracker} class={styles.userTrackerBlock} />
        ))}
      <NavLink to="/main/addTrackers" className={styles.addTrackerBtn}>
        Add Integration
      </NavLink>
    </div>
  )
}

export default React.memo(UserTrackers)
