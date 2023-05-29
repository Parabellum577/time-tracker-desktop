import axios from 'axios'
import { app, dialog } from 'electron'
import * as compareVersions from 'compare-versions'
import * as os from 'os'
import * as sudo from 'sudo-prompt'
import * as uuidV1 from 'uuid/v1'
import * as wget from 'wget'
import { EventEmitter } from 'events'

export interface ILatestBuildInfo {
  fileName: string
  version: string
}

export interface ILatestBuildInfo {
  fileName: string
  version: string
}

class LinuxAutoUpdater extends EventEmitter {
  public feedUrl: string
  public updateURL: string
  public isDownloaded: boolean
  public isDownloadStarted: boolean
  public isDialogOpen: boolean
  public filename: string
  public tmp: string

  constructor() {
    super()
    this.feedUrl = null
    this.isDownloaded = false
    this.isDownloadStarted = false
    this.isDialogOpen = false
    this.filename = uuidV1()
    this.tmp = os.tmpdir() + `/${this.filename}.deb`
  }

  public setFeedURL(url: string) {
    this.feedUrl = url
  }

  public checkForUpdates = async () => {
    if (!this.feedUrl) {
      throw new Error('Please set feed url')
    }

    this.emitCheckingForUpdate()
    try {
      const data = await this.getLatestUpdate()
      this.updateURL = `${this.feedUrl}/${data.fileName}`
      if (compareVersions(data.version, app.getVersion())) {
        this.downloadAndInstall()
      } else {
        this.emitUpdateNotAvailable()
      }
    } catch (error) {
      console.error(error)
    }
  }

  public downloadAndInstall() {
    if (this.isDownloaded) {
      this.quitAndInstall()
    } else {
      this.download()
    }
  }

  public download() {
    console.log('LinuxAutoUpdater -> download', this.isDownloadStarted)
    if (this.isDownloadStarted) {
      return
    }
    this.isDownloadStarted = true
    const url = this.updateURL
    console.log('LinuxAutoUpdater -> download -> wget', wget)
    const download = wget.download(url, this.tmp)

    download.on('error', (err: any) => {
      this.isDownloadStarted = false
      dialog.showErrorBox('Timeguard update error', err)
      console.error(err)
    })

    download.on('progress', (progress: any) => console.log('download update', progress))

    download.on('end', () => {
      this.emitUpdateDownloaded()
      this.isDownloaded = true
      console.log('LinuxAutoUpdater -> download -> this.isDownloaded', this.isDownloaded)
    })
  }

  /**
   * Install update. Run subprocess with administrator privileges
   */
  public quitAndInstall() {
    if (this.isDialogOpen) {
      return
    }

    this.isDialogOpen = true
    const options = {
      name: 'timetracker Update',
      process: {
        options: {},
        on: () => {},
      },
    }

    const errPermisionDenied = 'User did not grant permission'
    console.log(`dpkg -i ${this.tmp}`)

    sudo.exec(`dpkg -i ${this.tmp}`, options, (err: any) => {
      if (err && !err.toString().includes(errPermisionDenied)) {
        dialog.showErrorBox('timetracker update error', err)
        console.error(err)
      } else if (!err) {
        app.exit()
      }
      this.isDialogOpen = false
    })
  }

  private emitCheckingForUpdate() {
    this.emit('checking-for-update')
  }

  private emitUpdateNotAvailable() {
    this.emit('update-not-available')
  }

  private emitUpdateDownloaded() {
    this.emit('update-downloaded')
  }

  private getLatestUpdate = async (): Promise<ILatestBuildInfo> => {
    const response = await axios.get(`${this.feedUrl}/latest.json`)
    return response.data
  }
}

export default new LinuxAutoUpdater()
