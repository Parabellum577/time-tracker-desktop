import * as React from 'react'
import { useDispatch } from 'react-redux'
import classNames from 'classnames'
import { ipcRenderer } from 'electron'

import { openExternal } from '@services/openWindow'
import * as updaterActions from '@store/updater/actions'
import { IRootState } from '@store/rootReducer'
import useShallowEqualSelector from '@services/useShallowEqualSelector'
import * as openChatAction from '@store/supportChatWindow/actions'
import IconWrapper from '@components/IconWrapper'

const styles = require('./info.module.scss')

const Help: React.FC = () => {
  const isUpdate = useShallowEqualSelector((state: IRootState) => state.updates.isUpdate)
  const dispatch = useDispatch()
  const updateApplication = React.useCallback(() => {
    if (isUpdate) {
      dispatch(updaterActions.updateApplication())
    }
  }, [dispatch, isUpdate])

  const openChat = React.useCallback(() => {
    dispatch(openChatAction.openChatWindowAction())
  }, [dispatch])

  let devToolsOpenTimer: NodeJS.Timeout

  const openLink = (link: string) => {
    openExternal(`https://timetracker.com/${link}`)
  }

  const devToolsOpen = () => {
    devToolsOpenTimer = setTimeout(() => {
      ipcRenderer.send('openDevTools', 'ping')
    }, 3000)
  }

  const breakOpeningDevTools = () => {
    clearTimeout(devToolsOpenTimer)
  }

  return (
    <div className={styles.main}>
      <div className={styles.contentBlock}>
        <h3>timetracker</h3>
        <span className={styles.title}> Current Version v. {process.env.version}</span>
        <button
          onClick={updateApplication}
          className={classNames(styles.updateButton, { [styles.updateAvailableBtn]: isUpdate })}
        >
          {isUpdate ? 'Update available' : 'Newest version'}
        </button>
        <p>
          timetracker is a unique time tracking software that helps to improve your daily efficiency. For details on how
          your data is governed and selfguarded refer to
        </p>
        <div className={styles.linksBlock}>
          <a href="#" onClick={() => openLink('terms-of-use/')}>
            Terms of Use
          </a>
          <span>and</span>
          <a href="#" onClick={() => openLink('privacy-policy/')}>
            Privacy Policy
          </a>
          .
        </div>
      </div>
      <div className={styles.contentBlock}>
        <div className={styles.questions}>
          <h3 className={styles.questionTitle}>
            Have a{' '}
            <span onMouseDown={devToolsOpen} onMouseUp={breakOpeningDevTools}>
              Q
            </span>
            uestion
          </h3>
          <button type="button" onClick={() => openLink('faq/')}>
            Browse FAQ
          </button>
        </div>
        <span>Need a help?</span>
        {/* <a href="#">Send log to Support</a> */}
        <IconWrapper name="iconIntercom" classes={styles.intercomIcon} onClick={openChat} />
      </div>
    </div>
  )
}

export default React.memo(Help)
