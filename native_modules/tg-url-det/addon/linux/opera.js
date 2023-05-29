const sqlite3 = require('sqlite3').verbose()
const tempDB = new sqlite3.Database('./addon/linux/tempDB.sqlite')
const fs = require('fs')

const operaPath = '/home/user/.config/opera/History'
var tempIdOpera

module.exports = function(callback) {
  operaAccess(callback)
}

function operaAccess(callback) {
  fs.access(operaPath, fs.constants.F_OK, err => {
    //проверяет наличие БД по указаному пути
    if (!err) {
      idOpera(callback)
    }
  })
}

function idOpera(callback) {
  tempDB.each('SELECT id FROM idOpera WHERE id=(SELECT max(id) FROM idOpera)', function(err, row) {
    tempIdOpera = row.id
    selectOpera(callback)
  })
}

function selectOpera(callback) {
  operaDB = new sqlite3.Database(operaPath) //Инициализирует уже созданую БД
  operaDB.each('SELECT url, id FROM urls WHERE id>? LIMIT 1', tempIdOpera, function(err, row) {
    if (err) return // БД может быть занята браузером в этот момент
    if (row !== null) {
      tempDB.run('INSERT into idOpera(id) VALUES (?)', row.id)
      callback(row.url)
    }
  })
}
