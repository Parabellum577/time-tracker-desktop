import { nativeImage, BrowserWindow } from 'electron'
import TraySettings from './tray'
import createTrayWindow, { closeTrayWindow } from './window-for-tray'

export type TimerState = 'taskTracking' | 'overdue'

export async function createCanvasIcon(state: TimerState, elapsed: number, total: number) {
  let trayWindow: BrowserWindow = null

  trayWindow = await createTrayWindow()

  trayWindow.webContents
    .executeJavaScript(
      `
          const size = process.platform === 'linux' ? 24 : 16
          const bgColor = '#22313F'
          const workColor = '#1bb934'
          const overdueColor = '#ed1d41'
          const coldPlanning = '#58c4f5'
          let arcColor
  
          if ('${state}' === 'overdue') {
            arcColor = overdueColor
          } else {
            arcColor = workColor
          }

          const remainingTime = 1 - ${elapsed} / ${total}
          const lineWidth = 1.5
          const outerRadius = size / 2
          const innerRadius = size / 2 - lineWidth
          const fullCircle = 2 * Math.PI
          const startAngle = -Math.PI / 2
          const endAngle = '${state}' === 'overdue' ? fullCircle : remainingTime * fullCircle + startAngle
          const center = outerRadius
          const pauseLineHeight = 5
          const canvas = document.createElement('canvas')
          
          canvas.width = size
          canvas.height = size
  
          const ctx = canvas.getContext('2d')
  
          ctx.fillStyle = bgColor
          ctx.strokeStyle = arcColor
          ctx.lineWidth = lineWidth
  
          ctx.beginPath()
          ctx.arc(center, center, outerRadius, 0, fullCircle, false)
          ctx.fill()
  
          ctx.beginPath()
          ctx.arc(center, center, innerRadius, startAngle, endAngle, false)
          ctx.stroke()

          ctx.beginPath();
          ctx.strokeStyle = arcColor;
          ctx.fillStyle = arcColor;
          ctx.fillRect(size/2-2.3, size/2 - pauseLineHeight/2, 1.5, pauseLineHeight);
          ctx.fillRect(size/2 + 0.8, size/2 - pauseLineHeight/2, 1.5, pauseLineHeight);
          ctx.fill();
          
          canvas.toDataURL('image/png')
        `,
      true,
      setCanvasIcon,
    )
    .finally(() => {
      closeTrayWindow(trayWindow)
    })
}

const setCanvasIcon = (icon: string) => {
  const traySettings = TraySettings.getInstance()
  const nativeImg = nativeImage.createFromDataURL(icon)
  traySettings.setIcon(nativeImg)
}
