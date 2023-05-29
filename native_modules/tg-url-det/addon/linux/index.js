// const sqlite3 = require('sqlite3').verbose()
// var tempDB

// const fs = require('fs')

module.exports = function(callback) {
  accessTemp(callback)
}

function accessTemp(callback) {
  const cmd = `cat -e $HOME/.config/google-chrome/Default/'Current Session' | sed -e 's/\^@/\n/g' -e '/_\/chrome/d' | grep -Po '(http|https)://\K.*' | sort -u`
  var exec = require('child_process').exec
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return
    }
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
    callback(stdout || stderr)
  })
}
