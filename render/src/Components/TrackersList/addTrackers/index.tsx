import * as React from 'react'
import { ALL_SUPPORTED_TRACKERS } from '@services/helpers'
import { MainContext } from '@Routers'
import Tracker from '@components/Tracker'
import SearchTrackerBar from '../searchTrackerBar'

const styles = require('./tracker-list.module.scss')

const AddTrackers: React.FC = props => {
  const context = React.useContext(MainContext)

  return (
    <div className={styles.trackerSection}>
      <SearchTrackerBar />
      <div className={styles.trackersWrapper}>
        <div className={styles.trackersContainer}>
          {ALL_SUPPORTED_TRACKERS.map(tracker => (
            <Tracker key={tracker.Type} tracker={tracker} class={styles.addTrackerBlock} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default React.memo(AddTrackers)
