import * as React from 'react'
import IconWrapper from '@components/IconWrapper'
import { NavLink } from 'react-router-dom'
import useShallowEqualSelector from '@services/useShallowEqualSelector'

const styles = require('./styles.module.scss')

const ProblemsWithIntegration: React.FC = () => {
  const userTracker = useShallowEqualSelector(state => state.trackers.userTrackers)
  const isHaveProblems = userTracker.find(tracker => !tracker.Status)

  return (
    isHaveProblems && (
      <NavLink to="/main/userTrackers" className={styles.link}>
        <div className={styles.container}>
          <span>You got problems with some integration. Please, reintegrate this tracking system</span>
          <IconWrapper name="warning" classes={styles.icon} />
        </div>
      </NavLink>
    )
  )
}

export default React.memo(ProblemsWithIntegration)
