import axios from 'axios'
const events = require('events')

export default class IsItConnected extends events {
  public static testConnection(microservice: 'user' | 'planning' = 'user') {
    return axios(`${process.env.API_URL}/${microservice}`, { timeout: 60000, method: 'OPTIONS' })
  }

  private connected: boolean = null
  private waitingTime: number = 60000
  private watching: boolean = null

  public watch() {
    this.watching = true
    IsItConnected.testConnection()
      .then(() => {
        if (!this.connected && this.watching) {
          this.connected = true
          this.emit('online')
        }
        if (this.watching) {
          setTimeout(() => {
            if (this.watching) {
              this.watch()
            }
          }, this.waitingTime)
        }
      })
      .catch(() => {
        if ((this.connected === null || this.connected) && this.watching) {
          this.connected = false
          this.emit('offline')
        }
        if (this.watching) {
          setTimeout(() => {
            if (this.watching) {
              this.watch()
            }
          }, 1000)
        }
      })
  }
}
