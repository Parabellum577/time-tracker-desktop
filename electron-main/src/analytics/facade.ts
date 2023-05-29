import { ipcMain, ipcRenderer } from 'electron'
import GAAnalyticsTracker from './trackers/ga-tracker'
import { isRenderer } from '@utils'

class AnalyticsFacade {
  private trackers: GAAnalyticsTracker[] = null

  constructor(trackingIdList: string[]) {
    this.trackers = trackingIdList.map(trackingId => {
      return this.createTrackerInstance(trackingId)
    })

    this.subscribeToEvents()
  }

  public sendEvent = (eventCategory: string, eventAction: string) => {
    this.trackers.forEach(tracker => {
      tracker.trackEvent(eventCategory, eventAction)
    })
  }

  private createTrackerInstance = (trackingId: string) => {
    return new GAAnalyticsTracker(trackingId)
  }

  private subscribeToEvents = () => {
    ipcMain.on('analytics:event', (event: Event, eventCategory: string, eventAction: string) => {
      this.sendEvent(eventCategory, eventAction)
    })
  }
}

let analytics: AnalyticsFacade

export const init = () => {
  if (process.env.STAGE !== 'production') {
    return
  }
  analytics = new AnalyticsFacade(['UA-73424575-4'])
}

export const sendEvent = (eventCategory: string, eventAction: string) => {
  try {
    if (!analytics) {
      return
    }

    if (isRenderer()) {
      ipcRenderer.send('analytics:event', eventCategory, eventAction)
    } else {
      analytics.sendEvent(eventCategory, eventAction)
    }
  } catch (error) {
    console.error(error)
  }
}
