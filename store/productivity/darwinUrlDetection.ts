import { parseDomain } from '@services/helpers'
import osa from './osa'
// const osa = __non_webpack_require__('osa2')
const safariCallback = () => {
  try {
    const SystemSafari = Application('System Events').processes.Safari.windows.name()[0]
    if (SystemSafari != null) {
      const Safari = Application('Safari')
      return JSON.stringify({
        url: Safari.documents.url()[0] || '',
        title: Safari.documents.name()[0] || '',
      })
    }
  } catch (error) {
    // console.log(error);
  }
  return null
}

const chromeCallback = () => {
  try {
    const SystemChrome = Application('System Events').processes.Chrome.windows.name()[0]
    if (SystemChrome != null) {
      const Chrome = Application('Google Chrome')
      return JSON.stringify({
        url: Chrome.windows.activeTab.url()[0] || '',
        title: Chrome.windows.activeTab.name()[0] || '',
      })
    }
  } catch (error) {
    // console.log(error);
  }
  return null
}

export default async (currentTitle: string) => {
  try {
    const resultSafari = await osa(safariCallback)
    const resultChrome = await osa(chromeCallback)
    const dataSafari = JSON.parse(resultSafari)
    const dataChrome = JSON.parse(resultChrome)
    if (!dataSafari && !dataChrome) {
      return ''
    }

    if (dataSafari && currentTitle.replace(/\W/gi, '').includes(dataSafari.title.replace(/\W/gi, ''))) {
      return parseDomain(dataSafari.url)
    }

    if (dataChrome && currentTitle.replace(/\W/gi, '').includes(dataChrome.title.replace(/\W/gi, ''))) {
      return parseDomain(dataChrome.url)
    }

    return ''
  } catch (error) {
    console.error(error)
  }

  return ''
}
