const mongoose = require('mongoose')

mongoose.Promise = global.Promise

//use enviorment process to determine db connect
const db_uri = encodeURI(String(process.env.MONGODB_URI))

mongoose
    .connect(db_uri, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(console.log)


module.exports = { mongoose }