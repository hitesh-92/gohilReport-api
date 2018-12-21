const mongoose = require('mongoose')
const ArticleLog = require('../api/models/articleLog');
const Column =  require('../api/models/column');

/*
    SEED DATA
*/

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
    },
    {
        _id: new mongoose.Types.ObjectId(),
        createdAt: '1545290555595',
        title: 'four fire free fear FFFF',
        url: 'http://fore.com'
    }
]

const columns = [
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'left',
        lastUpdated: new Date().getTime(),
        articlesID: articles.map(log => log._id)
    }
]

/* 
    ArticleLog beforeEach hooks
*/

const deleteArticles = () => {
    return new Promise((resolve, reject) => {
        ArticleLog.deleteMany({}).then(() => resolve())
        .catch(e => reject(e))
    })
}

const seedArticles = (data) => {
    return new Promise((resolve, reject) => {
        ArticleLog.insertMany(data).then(() => resolve())
        .catch(e => reject(e))
    })
}


/* 
    Column beforeEach hooks
*/
const seedColumns = (done) => {
    Column.deleteMany({}).then(() => {
        return Column.insertMany(columns[0]).then(() => {
            done()
        })
    }).catch(e => console.log(e))
}

module.exports = {
    articles,
    columns,
    seedArticles,
    deleteArticles
}