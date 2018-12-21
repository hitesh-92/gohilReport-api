const mongoose = require('mongoose')

const db_uri = process.env.MONGODB_URI

const options = {
  useNewUrlParser: true,
  useCreateIndex: true, //found on GitHub. check initial seedArticles in seedData.js
}

mongoose.Promise = global.Promise;

mongoose.connect(db_uri, options);

/*
  TESTING
*/
mongoose.set('debug', false)

module.exports = { mongoose }