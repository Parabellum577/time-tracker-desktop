import * as React from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import api from '@services/api'
import IconWrapper from '@components/IconWrapper'
import { openExternal } from '@services/openWindow'
import { IUserScreenshotSettings } from '@types'

const styles = require('./integrated-storage.module.scss')

interface IIntegratedStorageProps {
  storage: IUserScreenshotSettings
  removeStorage: () => void
}

interface IIntegratedStorageState {
  anchorEl: null | HTMLElement
}

class IntegratedStorage extends React.PureComponent<IIntegratedStorageProps, IIntegratedStorageState> {
  public state: IIntegratedStorageState = {
    anchorEl: null,
  }

  get storageName() {
    if (this.props.storage.StorageType === 'GOOGLE_DRIVE') {
      return 'Google Drive'
    } else {
      return 'Dropbox'
    }
  }

  public redirectToStorageFolder = () => {
    if (this.props.storage.StorageType === 'GOOGLE_DRIVE') {
      openExternal('https://drive.google.com/drive/my-drive')
    } else {
      openExternal('https://www.dropbox.com/home')
    }
  }

  public disconnectStorage = () => {
    this.props.removeStorage()
    api.screenshot.UserRemoveIntegration()
  }

  public openMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  public closeMenu = (event: React.SyntheticEvent<{}, Event>) => {
    event.stopPropagation()
    event.preventDefault()
    this.setState({ anchorEl: null })
  }

  public getMenuDropdown = () => (
    <Menu
      anchorEl={this.state.anchorEl}
      open={!!this.state.anchorEl}
      onClose={this.closeMenu}
      PaperProps={{
        style: {
          height: 52,
          width: 160,
          marginTop: 32,
          marginLeft: -17,
        },
      }}
      MenuListProps={{
        style: {
          paddingTop: 8,
          paddingBottom: 8,
          background: '#fff',
        },
      }}
    >
      <MenuItem
        selected={false}
        onClick={this.disconnectStorage}
        style={{ height: '36px', padding: 0, background: '#F2F4F7' }}
      >
        <span
          style={{
            fontSize: '14px',
            fontWeight: 550,
            color: ' #48555e',
            marginLeft: '16px',
            cursor: 'pointer',
          }}
        >
          Remove
        </span>
      </MenuItem>
    </Menu>
  )

  public render() {
    const { storage } = this.props
    return (
      <div className={styles.integratedStore}>
        <div className={styles.storeHead}>
          <div className={styles.userBlock}>
            <div className={styles.avatarWrapper}>
              <IconWrapper name="defaultAvatar" classes={styles.userImage} />
            </div>
            <IconWrapper name={storage.StorageType} classes={styles.labelImage} />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{this.storageName}</span>
              <span className={styles.userEmail}>{storage.Email}</span>
            </div>
          </div>
          <div>
            <IconWrapper name="more_horiz" classes={styles.disconnectMenu} onClick={this.openMenu} />
            {this.getMenuDropdown()}
          </div>
        </div>
        <div className={styles.folderBlock}>
          <div className={styles.folderName} onClick={this.redirectToStorageFolder}>
            <IconWrapper name="folder" classes={styles.folderIcon} />
            <span>{storage.FolderName}</span>
          </div>
          <button className={styles.folderBtn} onClick={this.redirectToStorageFolder}>
            Go to Folder
          </button>
        </div>
      </div>
    )
  }
}

export default IntegratedStorage
