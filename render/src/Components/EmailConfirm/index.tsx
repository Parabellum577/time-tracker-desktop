import * as React from 'react'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import { openExternal } from '@services/openWindow'

const styles = require('./styles.module.scss')

const EmailConfirm: React.FC = () => {
  const currentUserLogin = useShallowEqualSelector(state => state.user.currentUser.Login)
  const mailProvider = currentUserLogin.split('@')[1] || ''

  const checkYourMailbox = () => {
    openExternal(`https://${mailProvider}/`)
  }

  return (
    <div className={styles.confirmEmailBlock}>
      <p>Please confirm your email. </p>
      <button onClick={checkYourMailbox}>Check your mailbox</button>
    </div>
  )
}

export default React.memo(EmailConfirm)
