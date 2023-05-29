import { IUserScreenshotSettings } from '@services/types'

export interface IScreenShotStorageState {
  availableStorage: IUserScreenshotSettings
  status: boolean
}
