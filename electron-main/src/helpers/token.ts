import { BrowserWindow } from 'electron'
import { EventEmitter } from 'events'

class Token extends EventEmitter {
  public token = ''
  public projectID = ''
  public trackerID = -1
  public issueID = ''

  public loginByOTSCode = (urlString: string, win: BrowserWindow) => {
    this.setNewToken(urlString)
    win.webContents.send('ots-login', this.token)
  }

  public setNewToken = (urlString: string) => {
    const queriesRaw = /timetracker\w*:\/\/open\/?\?(.*)/.exec(urlString)
    console.log('TCL: Token -> publicsetNewToken -> queriesRaw', queriesRaw)
    if (!queriesRaw) {
      return
    }

    const queries = queriesRaw[1].split('&').map(str => {
      const query = str.split('=')
      return {
        key: query[0],
        value: query[1],
      }
    })
    console.log('TCL: Token -> publicsetNewToken -> queries', queries)
    this.token = queries.find(query => query.key === 'otscode').value.slice(9)
    if (queries.length > 1) {
      this.projectID = queries.find(query => query.key === 'project_id').value
      this.trackerID = +queries.find(query => query.key === 'tracker_id').value
      this.issueID = queries.find(query => query.key === 'issue_id').value
      this.emit('START/STOP_PLANNING', { ProjectID: this.projectID, TrackerID: this.trackerID, IssueID: this.issueID })
    }
  }
}

export default new Token()
