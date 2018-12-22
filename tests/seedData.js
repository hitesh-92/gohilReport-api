const Column = require('../api/models/column')
const ArticleLog = require('../api/models/articleLog')
const ObjectId = require('mongoose').Types.ObjectId


/*
    DATA
*/

// Article

const articleData = [
    {
        title: 'test Article 1',
        url: 'http://www.testarticleone.co',
        createdAt: '1543499781111'
    },
    {
        title: 'two test tweet tweed',
        url: 'http://sseecondd.com',
        createdAt: '1543498582222'
    },
    {
        title: 'three thrid triad train',
        url: 'http://thirrrd.com',
        createdAt: '1545290573333'
    },
    {
        title: 'four fire free fear',
        url: 'http://fore.com',
        createdAt: '1545290554444'
    }
];

const buildArticleData = (data) => {
    
    const result = new Array()

    data.forEach(log => {

        const article = new ArticleLog({
            _id: new ObjectId(),
            title: log.title,
            url: log.url,
            createdAt: log.createdAt
        })

        result.push(article)

    })
    return result;
};

const articles = buildArticleData(articleData)

// const articles = [
//     {
//         // _id: new mongoose.Types.ObjectId(),
//         _id: new ObjectId(),
//         createdAt: "1543499781111",
//         title: 'test Article 1',
//         url: 'http://www.testarticleone.co'
//     },
//     {
//         _id: new ObjectId(),
//         createdAt: '1543498582222',
//         title: 'two test tweet tweed',
//         url: 'http://sseecondd.com'
//     },
//     {
//         _id: new ObjectId(),
//         createdAt: '1545290573333',
//         title: 'three thrid triad train',
//         url: 'http://thirrrd.com'
//     },
//     {
//         _id: new ObjectId(),
//         createdAt: '1545290554444',
//         title: 'four fire free fear',
//         url: 'http://fore.com'
//     }
// ]

// Column

const buildColumnData = (data) => {
    /*
        data param to be the articles array
    */

    const all_ids = data.map(each => each._id)
    const columnOneData = [ all_ids[0], all_ids[1] ]
    const columnTwoData = [ all_ids[2], all_ids[3] ]

    const columnOne = new Column({
        _id: new ObjectId(),
        title: 'left',
        lastUpdated: new Date().getTime(),
        articleIDs: columnOneData
    })

    const columnTwo = new Column({
        _id: new ObjectId(),
        title: 'right',
        lastUpdated: new Date().getTime(),
        articleIDs: columnTwoData
    })

    return [columnOne, columnTwo]
};

const columns = buildColumnData(articles)

/*
    HOOKS beforeEach
*/

const testDelete = MODEL => {
    return new Promise((resolve, reject) => {
        MODEL
            .deleteMany({})
            .then(() => resolve())
            .catch(e => reject(e))
    })
};

const testSeed = function(MODEL, data){
    return new Promise((resolve, reject) => {
        MODEL
            .insertMany(data)
            .then(() => resolve())
            .catch(e => reject(e))
    })
};
// arrow function did not work. bind issue? had to use old

module.exports = { articles, columns, testDelete, testSeed }