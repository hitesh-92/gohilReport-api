const Column = require('../api/models/column');
const ArticleLog = require('../api/models/articleLog');
const User = require('../api/models/user');
const ObjectId = require('mongoose').Types.ObjectId;
const Data = require('./data.json')


const buildSingleArticle = ({
    title,
    url,
    createdAt
}) => new ArticleLog({
    _id: new ObjectId(),
    title,
    url,
    createdAt
})

const buildArticleData = (articleData) => articleData.map(data => buildSingleArticle(data))

const buildColumnData = (data) => {
    const ids = data.map(each => each._id);

    const columnData = [
        [ ids[0], ids[1] ],
        [ ids[2], ids[3] ],
        [ ids[4], ids[5] ],
        [ ids[6], ids[7] ]
    ]

    const columnNames = [ 'left', 'right', 'center', 'archive' ]

    const buildSingleColumn = (title, articleIDs) => new Column({
        _id: new ObjectId(),
        lastUpdated: Date.now(),
        title,
        articleIDs
    })

    return columnNames.map( (title, i) => buildSingleColumn( title, columnData[i] ) )
};

const buildUserData = (data) => data.map( ({
    email,
    password
}) => new User({
    _id: new ObjectId(),
    createdAt: Date.now(),
    email,
    password
}))

/* 
    BUILD DATA
*/
const articles = buildArticleData(Data.articleData);
const users = buildUserData(Data.userData);
const columns = buildColumnData(articles);

/*
    HOOKS
*/

const testDelete = MODEL => {
    return new Promise((resolve, reject) => {
        MODEL.deleteMany({})
        .then(() => resolve())
        .catch(e => reject(e))
    })
};

const testSeed = function(MODEL, data){
    return new Promise((resolve, reject) => {
        MODEL.insertMany(data)
        .then(() => resolve())
        .catch(e => reject(e))
    })
};


const testSeedUsers = (data) => {
    const userOne = new User(data[0]).save();
    const userTwo = new User(data[1]).save();
    return Promise.all([userOne, userTwo])
}

module.exports = { 
    articles, 
    columns, 
    users,
    testDelete, 
    testSeed, 
    testSeedUsers,
    buildArticleData,
    buildColumnData
};