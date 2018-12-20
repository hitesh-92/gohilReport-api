const mongoose = require('mongoose')

//use enviorment process to determine db connect
const db_uri = process.env.MONGODB_URI

const options = {
  useNewUrlParser: true,
  useCreateIndex: true, //found on GitHub. check initial seedArticles in seedData.js
}

mongoose.connect(db_uri, options);
mongoose.Promise = global.Promise;


module.exports = { mongoose }