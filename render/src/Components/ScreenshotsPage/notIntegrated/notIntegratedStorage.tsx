import * as React from 'react'
import classNames from 'classnames'
import api from '@services/api'
import IconWrapper from '@components/IconWrapper'
import { openExternal } from '@services/openWindow'
import { STORAGES } from '@services/helpers'

const styles = require('./not-integrated-storage.module.scss')

interface IStorage {
  name: string
  img: string
  type: string
  url: string
}

interface INotIntegratedStorageProps {
  storage: IStorage
  hasConnectedStorage: boolean
}

class NotIntegratedStorage extends React.PureComponent<INotIntegratedStorageProps> {
  public connectStorage = async () => {
    if (this.props.storage.type === 'GOOGLE_DRIVE' || this.props.storage.type === 'DROPBOX') {
      const OTS = await api.user.GetOTS()
      openExternal(`${process.env.REDIRECT_URL}/desktop/login?otscode=${OTS}&action=ScreenshotSettings`)
    } else {
      this.getAuthURL()
    }
  }

  public getAuthURL = async () => {
    try {
      const URI = await api.screenshot.UserOAuthRedirectURI({ StorageType: 'DROPBOX' })
      console.log('URI ==>', URI)
    } catch (error) {
      console.error(`getAuthURL error: ${error.message}`)
    }
  }

  public render() {
    const { storage, hasConnectedStorage } = this.props
    const alreadyConnectedStorage = STORAGES.filter(s => s.type !== storage.type)[0].name
    return (
      <div
        className={classNames(styles.screenshotStorageBlock, {
          [styles.activeScreenBlock]: !hasConnectedStorage,
        })}
      >
        <div className={styles.iconWrap}>
          <IconWrapper name={storage.type} height="63px" width="63px" />
        </div>
        <div className={styles.connectStorageText}>
          {hasConnectedStorage ? (
            <React.Fragment>
              <p>You can Connect Only One Storage</p>
              <p>
                To Connect {storage.name} Disconnect {alreadyConnectedStorage} First
              </p>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <p>Connect your {storage.name}</p>
              <p>to save your screenshots</p>
            </React.Fragment>
          )}
        </div>
        <div className={styles.connectBtn}>
          {!hasConnectedStorage && (
            <button className={styles.activeBtn} onClick={this.connectStorage}>
              Connect
            </button>
          )}
        </div>
      </div>
    )
  }
}

export default NotIntegratedStorage
