import * as _ from 'lodash'
import * as q from 'q'

import { IBasicIssue, IFullIssue } from '@types'
import api from './api'

export default async (basicIssues: IBasicIssue[]): Promise<IFullIssue[]> => {
  const groupedByProjectBookmarks = _.groupBy(basicIssues, issue => [issue.TrackerID, issue.ProjectID])
  const fullIssues: IFullIssue[] = []
  const deffer: Array<Promise<IFullIssue[]>> = []
  for (const key in groupedByProjectBookmarks) {
    if (key in groupedByProjectBookmarks) {
      const { TrackerID, ProjectID } = groupedByProjectBookmarks[key][0]
      deffer.push(api.tracker.GetProjectIssues({ TrackerID, ProjectID }))
    }
  }

  const data = await q.allSettled(deffer)
  let iterator = 0
  for (const key in groupedByProjectBookmarks) {
    if (key in groupedByProjectBookmarks) {
      if (data[iterator].state === 'fulfilled') {
        for (const basicIssue of groupedByProjectBookmarks[key]) {
          const issue = data[iterator].value.find(
            fullIssue =>
              fullIssue.TrackerID === basicIssue.TrackerID &&
              fullIssue.ProjectID === basicIssue.ProjectID &&
              fullIssue.ID === basicIssue.IssueID,
          )
          if (issue) {
            fullIssues.push(issue)
          }
        }
      }
      iterator += 1
    }
  }
  return fullIssues
}
