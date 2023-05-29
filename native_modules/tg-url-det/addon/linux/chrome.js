const sqlite3 = require('sqlite3').verbose()
const tempDB = new sqlite3.Database('./addon/linux/tempDB.sqlite')
const fs = require('fs')

const chromePath = '/home/user/.config/google-chrome/Default/History'
const opera = require('./opera')
var tempIdChrome

module.exports = function(callback) {
  chromeAccess(callback)
}

function chromeAccess(callback) {
  fs.access(chromePath, fs.constants.F_OK, err => {
    //проверяет наличие БД по указаному пути
    if (!err) {
      idChrome(callback)
    } else {
      opera(callback) //если такой БД нету значит такого браузера в системе нету
    }
  })
}

function idChrome(callback) {
  tempDB.each('SELECT id FROM idChrome WHERE id=(SELECT max(id) FROM idChrome)', function(
    err,
    row,
  ) {
    tempIdChrome = row.id
    selectChome(callback)
  })
}

function selectChome(callback) {
  chromeDB = new sqlite3.Database(chromePath) //Инициализирует уже созданую БД
  chromeDB.each('SELECT url, id FROM urls WHERE id>? LIMIT 1', tempIdChrome, function(err, row) {
    if (err) return // БД может быть занята браузером в этот момент
    if (row !== null) {
      tempDB.run('INSERT into idChrome(id) VALUES (?)', row.id)
      callback(row.url)
    } else {
      opera(callback) //Если текушее значение равно сохраненому в локальной БД попробовать другой браузер
    }
  })
}
