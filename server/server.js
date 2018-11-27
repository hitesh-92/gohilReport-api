require('./config')
const app = require('../app')
const server = require('http').createServer(app)
server.listen(process.env.PORT)