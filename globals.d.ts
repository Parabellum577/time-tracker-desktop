declare module 'electron-connect'
declare module 'electron-redux'
declare module 'axios-logger'
declare module 'material-icons-react'
declare module '@material-ui/*'
declare module 'valid-url'
declare module 'internet-available'
declare module 'animejs'
declare module 'electron-default-menu'
declare module 'react-avatar-editor'
declare module 'sudo-prompt'
declare module 'wget'
declare module 'desktop-screenshot'
declare module 'bookmark-parser'

declare module '*.png' {
  const value: any
  export default value
}

declare module '*.svg' {
  const value: any
  export default value
}

declare const __non_webpack_require__: typeof require
declare const Application: any

type unixSeconds = number
type unixMilliseconds = number
type milliseconds = number
type seconds = number
type minutes = number
type hours = number
type days = number
