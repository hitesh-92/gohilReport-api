const mongoose = require('mongoose')
const ArticleLog = require('../api/models/articleLog');
const Column =  require('../api/models/column');

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
        url: 'http://sseecondd.com'
    },
    {
        _id: new mongoose.Types.ObjectId(),
        createdAt: '1545290577795',
        title: 'three thrid triad train',
        url: 'http://thirrrd.com'
    }
]

const columns = [
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'left',
        lastUpdated: new Date().getTime(),
        articlesID: [ 
            articles[0]._id,
            articles[1]._id,
            articles[2]._id
        ]
    }
]

/* \
*
 SEED DATA ARTICLE
*
*/


const seedArticles = (done) => {
    new Promise((resolve, reject) => {
        ArticleLog.deleteMany({})
            .then(() => {
                ArticleLog.insertMany(articles, (err, docs) => {
                    if (err) reject( new Error(err) )
                    console.log('RESOLVED PROMISE FROM SEED')
                    resolve(done())
                })    
        }).catch(e => new Error(e))
    });   
}



/* 
*
 SEED DATA COLUMN
*
*/
const seedColumns = (done) => {
    Column.deleteMany({}).then(() => {
        return Column.insertMany(columns[0]).then(() => {
            done()
        }).catch(e => console.log(e))
    }).catch(e => console.log(e))
}

module.exports = {articles, seedArticles, columns, seedColumns}