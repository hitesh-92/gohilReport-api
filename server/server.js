// require('./config')
//set environemnt
// const ENV = require('dotenv')
// ENV.config()
// console.log(
//     `port:${process.env.PORT} | ` +
//     `db_uri: ${process.env.MONGODB_URI}`
// );


const app = require('../app')
const server = require('http').createServer(app)



server.listen(process.env.PORT)