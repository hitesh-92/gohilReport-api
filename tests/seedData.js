console.log('\x1Bc');
const Column = require('../api/models/column');
const ArticleLog = require('../api/models/articleLog');
const User = require('../api/models/user');

const mongoose = require('mongoose')
const { Types: {ObjectId} } = mongoose

const {articleData, userData} = require('./data.json')

function createColumnIds(){
    let ids = []
    for(let i=0; i<5; i++) ids.push( ObjectId() )
    return ids
}

function buildColumns(ids){
    const titles = [ 'left', 'center', 'right', 'archive' ]
    return titles.map((title, i) => new Column({
        _id: new ObjectId( ids[i] ),
        title
    }) )
}

function buildArticles(data, columnIds){
    let articlesArray = [];

    for (let i=2; i<=data.length; i+=2){
        articlesArray.push( data.slice(i-2, i) )
    }

    return articlesArray.map( (articles,i) => {
        const columnId = columnIds[i]
        return articles.map( ({
            title,
            url,
            position
        }) => new ArticleLog({
            _id: ObjectId(),
            title,
            url,
            column: columnId,
            position
        }) )
    }).flat(1)
}

function buildUserData ([userOne, userTwo]){

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

const columnIds = createColumnIds()
const columns = buildColumns( columnIds )
const articles = buildArticles( articleData, columnIds )
const users = buildUserData( userData )

module.exports = {
    articles,
    columnIds,
    columns,
    users,
    testDelete,
    testSeed,
    testSeedUsers,
    logInToken: userData[0].tokens[0].token
};
