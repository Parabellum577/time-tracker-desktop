const fs = require('fs')
const package = require('../package.json')

var DEFAULT_STAGE = 'production'
var stage = process.env.BUILD_STAGE || DEFAULT_STAGE
var config = require('../config')[stage]
const template = fs.readFileSync('./utils/appcast.html', 'utf8')

module.exports = async context => {
  console.log(context)
  const version = package.version
  const outputFolder = context.outDir
  const appPackagePath = context.artifactPaths.find(path => /(exe|dmg|pkg|deb|AppImage|snap)$/.test(path))
  const fileName = appPackagePath.replace(`${outputFolder}`, '').replace(/[\/\\]/, '')
  const updateInfo = {
    fileName,
    version,
  }

  const url = `${config.REDIRECT_URL}/distribution/${process.platform}/${process.env.UPDATE_FOLDER || 'v3'}/${fileName}`
  const appcast = template
    .replace(/(\n|$)/gi, '')
    .replace(/\s{2,}/gi, ' ')
    .replace('{{BUILD_URL}}', url)

  fs.writeFileSync(`${outputFolder}/latest.json`, JSON.stringify(updateInfo))
  fs.writeFileSync(`${outputFolder}/appcast.html`, appcast)
}
