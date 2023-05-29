const uuidV4 = require('uuid/v4')
const request = require('request')

const GA_HOST = 'https://www.google-analytics.com'
const GA_VERSION = 1

/**
 * GA analitics tracker
 * @see https://developers.google.com/analytics/devguides/collection/protocol/v1/
 */
export default class GAAnalyticsTracker {
  private collectURL: string
  private gaTrackingId: string
  private clientId: string

  constructor(trackingID: string) {
    this.gaTrackingId = trackingID
    this.collectURL = GA_HOST + '/collect'
  }

  public trackEvent(category: string, action: string) {
    try {
      return this.sendEvent(category, action)
    } catch (error) {
      console.log('TCL: GAAnalyticsTracker -> trackEvent -> error', error)
      return error
    }
  }

  public sendEvent(category: string, action: string) {
    const params = { ec: category, ea: action }
    return this.sendRequest('event', params)
  }

  public sendRequest(hitType: string, params: object) {
    const clientId = this.getClientId()

    return new Promise((resolve, reject) => {
      const formObj = {
        v: GA_VERSION,
        tid: this.gaTrackingId,
        cid: clientId,
        t: hitType,
      }
      if (params) {
        Object.assign(formObj, params)
      }

      const reqObj = {
        url: this.collectURL,
        form: formObj,
      }

      return request.post(reqObj, (err: Error, httpResponse: any, body: any) => {
        if (err) {
          return reject(err)
        }

        let bodyJson = {}
        if (body && httpResponse.headers['content-type'] !== 'image/gif') {
          bodyJson = JSON.parse(body)
        }

        if (httpResponse.statusCode === 200) {
          return resolve({ clientID: formObj.cid })
        }

        if (httpResponse.headers['content-type'] !== 'image/gif') {
          return reject(bodyJson)
        }

        return reject(body)
      })
    })
  }

  public getClientId() {
    if (!this.clientId) {
      this.clientId = uuidV4()
    }
    return this.clientId
  }
}
