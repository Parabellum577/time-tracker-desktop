import { parseDomain } from '@services/helpers'
import { readdir } from 'fs'

const BMParser = process.platform === 'linux' ? __non_webpack_require__('bookmark-parser') : null

const getFileName = (path: string) =>
  new Promise((resolve, reject) => {
    readdir(path, (err, items) => {
      if (err) {
        reject(err)
        return
      }
      const filename = items.filter(str => /.*\.default-release$/.test(str))
      resolve(`${path}/${filename}/sessionstore-backups/recovery.jsonlz4`)
    })
  })

export default async (currentTitle: string) => {
  try {
    const path = `/home/${process.env.USER}/.mozilla/firefox`
    const backUpFilePath = await getFileName(path)
    const rawData = await BMParser.readFromJSONLZ4File(backUpFilePath)
    const result: Array<{ title: string; url: string }> = rawData.windows
      .map((win: any) => {
        return win.tabs.map((tab: any) => {
          return tab.entries.map(({ title, url }: { title: string; url: string }) => {
            return { title, url }
          })
        })
      })
      .flat(4)
    const activeTab = result.find(tab => currentTitle.includes(tab.title))
    return parseDomain(activeTab ? activeTab.url : '')
  } catch (error) {
    // File not found, Firefox wasn't launched
    if (error.errno !== -2) {
      console.error(error)
    }
  }

  return ''
}
