const Column = require('../api/models/column');
const ArticleLog = require('../api/models/articleLog');
const User = require('../api/models/user');
const ObjectId = require('mongoose').Types.ObjectId;
const {articleData, userData} = require('./data.json')

//build columns
//get columns ids [left,right,center,archive]
//build articles. ref column _id
//edit before each hooks =>
//  1. add column
//  2. add articles
//  3. add users

const buildArticleData = (articleData) => articleData.map( ({
    title,
    url,
    createdAt,
    column
}) => new ArticleLog({
    _id: new ObjectId(),
    title,
    url,
    createdAt,
    column
}) )

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

const buildUserData = ([userOne, userTwo]) => {

    const first = new User({
        _id: ObjectId( userOne._id ),
        createdAt: Date.now(),
        email: userOne.email,
        password: userOne.password,
        tokens: [
            {
                _id: new ObjectId(),
                access: 'auth',
                token: userOne.tokens[0].token
            }
        ]
    })

    const second = new User({
        _id: new ObjectId(),
        createdAt: Date.now(),
        email: userTwo.email,
        password: userTwo.password
    })

    return [first, second]
}

/* 
    BUILD DATA
*/
const articles = buildArticleData(articleData);
const users = buildUserData(userData);
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
    buildColumnData,
    logInToken: userData[0].tokens[0].token
};