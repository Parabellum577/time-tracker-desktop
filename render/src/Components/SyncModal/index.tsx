import * as React from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import IconWrapper from '@components/IconWrapper'
import { RootAction } from '@store/rootReducer'
import * as authActions from '@store/auth/actions'
import * as synchActions from '@store/synchronization/actions'

const styles = require('./styles.module.scss')

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
  bindActionCreators(
    {
      logout: authActions.signOut,
      becomeMaster: synchActions.becomeMaster,
    },
    dispatch,
  )

type IMainProps = ReturnType<typeof mapDispatchToProps>

const SyncModal: React.FC<IMainProps> = props => {
  return (
    <div className={styles.syncModal}>
      <IconWrapper name="syncIcon" />
      <p>
        <strong>timetracker is running on another device!</strong>
      </p>
      <p>Do you want to make this device active and stop tracking on another?</p>
      <div className={styles.buttonsBlock}>
        <button className={styles.activateBtn} onClick={() => props.becomeMaster()}>
          Activate
        </button>
        <button className={styles.logoutBtn} onClick={() => props.logout()}>
          Log Out
        </button>
      </div>
    </div>
  )
}

export default React.memo(connect(null, mapDispatchToProps)(SyncModal))
