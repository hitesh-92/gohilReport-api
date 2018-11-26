const mongoose = require('mongoose')
mongoose.Promise = global.Promise

//local db
// mongoose.connect('mongodb://localhost:27017/arch-tdd');

//use enviorment process to determine db connect
mongoose.connect(process.env.MONGODB_URI)

module.exports = { mongoose }