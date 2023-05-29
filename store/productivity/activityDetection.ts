import { ChildProcess } from 'child_process'

export default () => {
  let keyboardPressed = 0
  let mousePressed = 0
  let stream: ChildProcess = null

  const Track = () => {
    keyboardPressed = 0
    mousePressed = 0
    try {
      const { spawn } = __non_webpack_require__('child_process')
      stream = spawn('xinput', ['test-xi2', '--root'])
      const regexp = /type\s(\d+)/
      stream.stdout.on('data', data => {
        const match = data.toString().match(regexp)
        const type = match ? match[1] : null
        if (type === '14') {
          keyboardPressed += 1
        } else if (type === '15') {
          mousePressed += 1
        }
      })
      stream.on('error', console.error)
    } catch (error) {
      console.error(error)
    }
    return {
      destroy: () => {
        if (stream) {
          stream.kill()
        }
      },
    }
  }

  const Keyboard = () => {
    const result = keyboardPressed
    keyboardPressed = 0
    return result
  }

  const Mouse = () => {
    const result = mousePressed
    mousePressed = 0
    return result
  }

  return {
    Track,
    Keyboard,
    Mouse,
  }
}
