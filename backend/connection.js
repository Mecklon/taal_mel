const mysql = require("mysql2")

const pool = mysql.createPool({
    host:"127.0.0.1",
    user:"root",
    password:"Mf123456#",
    database:"project",
    dateStrings:true
}).promise()

module.exports = pool