const mongoose = require('mongoose')

const db_uri = process.env.MONGODB_URI

const options = {
  useNewUrlParser: true,
  useCreateIndex: true, //found on GitHub. check initial seedArticles in seedData.js
}

mongoose.Promise = global.Promise;
mongoose.connect(db_uri, options);

mongoose.connection.on('connected', () =>
  console.log('MognoDB Connected to API')
)

mongoose.connection.on('error', err => {
  console.log('Error establishing connection with MongoDB ==> \n', err);
  setTimeout(retryConnection, 5000);
})

function retryConnection(){
  console.log('Attempting to re-establish connection to MongoDB');
  return mongoose.connect(db_uri,options);
}

// mongoose.set('debug', false)

module.exports = { mongoose }
