import api from '@services/api'
// FIXME: rename method
export const fetchTrackerViaUrl = async (trackerUrl: string) => {
  try {
    if (!trackerUrl) {
      return
    }

    const { TrackerID } = await api.tracker.GetTracker({ URL: trackerUrl })
    const { URL } = await api.tracker.GetOAuthURL({ TrackerID })

    return { URL, TrackerID }
  } catch (error) {
    console.log(error)
  }
}

export const updateCacheByTrackersIDArray = (...trackers: number[]) => {
  api.project.UpdateProjectsCacheByTrackers({ TrackerIDs: trackers })
}
