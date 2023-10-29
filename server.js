const express = require("express");
const path = require('path')
var favicon = require('serve-favicon')

const app = express();

//app.get('/', function (req, res) {
//  res.sendFile(path.join(__dirname, 'main.html'));
//})
app.use(express.static(path.join(__dirname, "out/")));

app.use(favicon(path.join(__dirname, 'out/favicon.ico')))

//app.listen(8080, "localhost")
app.listen(8080, "192.168.1.62")
