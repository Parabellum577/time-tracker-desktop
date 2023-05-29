const sqlite3 = require('sqlite3').verbose()
const tempDB = new sqlite3.Database('./addon/linux/tempDB.sqlite')
const fs = require('fs')

var firefoxPath
const firefoxProfiles = '/home/user/.mozilla/firefox/'
const chrome = require('./chrome')
var tempIdFirefox

module.exports = function(callback) {
  firefoxDir(callback)
}

function firefoxDir(callback) {
  fs.readdir(firefoxProfiles, function(err, list) {
    list.forEach(function(file) {
      if (file.indexOf('default') != -1) {
        //Найти в профилях папку с именем чето-там.default
        firefoxPath = firefoxProfiles + '/' + file + '/places.sqlite'
        firefoxAccess(callback)
      } else {
        chrome(callback)
      }
    })
  })
}

function firefoxAccess(callback) {
  fs.access(firefoxPath, fs.constants.F_OK, err => {
    //проверяет наличие БД по указаному пути
    if (!err) {
      idFirefox(callback)
    } else {
      chrome(callback) //если такой БД нету значит такого браузера в системе нету
    }
  })
}

function idFirefox(callback) {
  tempDB.each('SELECT id FROM idFirefox WHERE id=(SELECT max(id) FROM idFirefox)', function(
    err,
    row,
  ) {
    tempIdFirefox = row.id
    selectFirefox(callback)
  })
}

function selectFirefox(callback) {
  firefoxDB = new sqlite3.Database(firefoxPath) //Инициализирует уже созданую БД
  firefoxDB.each('SELECT url, id FROM moz_places WHERE id>? LIMIT 1', tempIdFirefox, function(
    err,
    row,
  ) {
    if (err) return // БД может быть занята браузером в этот момент
    if (row != null) {
      tempDB.run('INSERT into idFirefox(id) VALUES (?)', row.id)
      callback(row.url)
    } else {
      chrome(callback) //Если текушее значение равно сохраненому в локальной БД попробовать другой браузер
    }
  })
}
