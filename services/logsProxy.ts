import * as log from 'electron-log'

export const init = () => {
  log.transports.console.level = false
  log.transports.rendererConsole.level = false
  const defaultLogger: any = {}
  const keys: Array<'log' | 'error' | 'warn'> = ['log', 'error', 'warn']

  keys.forEach(key => {
    defaultLogger[key] = console[key]
    console[key] = (...args: any[]) => {
      try {
        defaultLogger[key].call(undefined, ...args)
        log[key](
          args.map(element =>
            Array.from<string>(jsonify(element))
              .map(char => String.fromCharCode(char.charCodeAt(0) + 1))
              .join(''),
          ),
        )
      } catch (error) {
        defaultLogger.error(error)
      }
    }
  })
}

const jsonify = (obj: object) => {
  if (!obj) {
    return ''
  }
  try {
    return JSON.stringify(obj)
  } catch (error) {
    try {
      const seen: object[] = []
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object') {
          if (!seen.indexOf(value)) {
            return '__cycle__'
          }
          seen.push(value)
        }
        return value
      })
    } catch (error) {
      return 'Can\' be stringified'
    }
  }
}
