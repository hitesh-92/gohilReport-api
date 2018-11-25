const mongoose = require('mongoose')
mongoose.Promise = global.Promise

//local db
mongoose.connect('mongodb://localhost:27017/arch-tdd');

module.exports = { mongoose }