const path = require('path')
const zipFolder = require('zip-folder')

const version = require('../package.json').version

const DEFAULT_STAGE = 'development'
const stage = process.env.BUILD_STAGE || DEFAULT_STAGE

const srcFolder = path.join(__dirname, '../dist/extansion')
const outputFilePath = path.join(__dirname, `../dist/timetracker-${version}-${stage}.zip`)

zipFolder(srcFolder, outputFilePath, err => {
  if (err) {
    console.log('Error compress build folder', err)
  }
})
