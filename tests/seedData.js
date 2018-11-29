const mongoose = require('mongoose')
const ArticleLog = require('../api/models/articleLog');

const articles = [
    {
        _id: new mongoose.Types.ObjectId(),
        createdAt: "1543499786324",
        title: 'test Article 1',
        url: 'http://www.testarticleone.co'
    },
    {
        _id: new mongoose.Types.ObjectId(),
        createdAt: '1543498586378',
        title: 'two test tweet tweed',
        url: 'http://secondd.com'
    }
]

const seedArticles = (done) => {
    ArticleLog
    //   .remove({}) //deprecated
      .deleteMany({})
      .then(()=>{
          return ArticleLog.insertMany(articles)
      })
      .then(()=> done())
};

module.exports = {articles, seedArticles}