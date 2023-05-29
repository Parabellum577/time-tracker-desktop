import * as React from 'react'
import IconWrapper from '@components/IconWrapper'

const styles = require('./styles.module.scss')

const OfflineNotification: React.FC = () => {
  return (
    <div className={styles.offlineNotification}>
      <IconWrapper name="iconOffline" />
      <span>You are offline. Please check your internet connection</span>
    </div>
  )
}

export default React.memo(OfflineNotification)
