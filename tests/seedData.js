const Column = require('../api/models/column');
const ArticleLog = require('../api/models/articleLog');
const User = require('../api/models/user');
const ObjectId = require('mongoose').Types.ObjectId;


/*
    ARTICLE
*/

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
    },
    {
        title: 'foe fee flew five',
        url: 'http://fivee.com',
        createdAt: '1545290555555'
    },
    {
        title: 'sax sea soi six',
        url: 'http://sixsix.com',
        createdAt: '1545290556666'
    },
    
];

const buildSingleArticle = (data) => new ArticleLog({
    _id: new ObjectId(),
    title: data.title,
    url: data.url,
    createdAt: data.createdAt
})

const buildArticleData = (articleData) => articleData.map(data => buildSingleArticle(data))


/*
    COLUMN
*/

const buildColumnData = (data) => {
    const all_ids = data.map(each => each._id);
    const columnOneData = [ all_ids[0], all_ids[1] ];
    const columnTwoData = [ all_ids[2], all_ids[3] ];
    const columnThreeData = [ all_ids[4], all_ids[5] ];

    const columnOne = new Column({
        _id: new ObjectId(),
        title: 'left',
        lastUpdated: Date.now(),
        articleIDs: columnOneData
    });

    const columnTwo = new Column({
        _id: new ObjectId(),
        title: 'right',
        lastUpdated: Date.now(),
        articleIDs: columnTwoData
    });

    const columnThree = new Column({
        _id: new ObjectId(),
        title: 'center',
        lastUpdated: Date.now(),
        articleIDs: columnThreeData
    });

    return [columnOne, columnTwo, columnThree]
};


// USER
const userData = [
    {
        email: 'one@one.co',
        password: 'charchar0n3'
    },
    {
        email: 'two@two.co',
        password: 'tw3n7y2tw0z'
    }
]

const buildUserData = (data) => {

    let users = []

    for (user of data){

        const newUser = new User({
            _id: new ObjectId(),
            email: user.email,
            password: user.password,
            createdAt: Date.now()
        })

        users.push(newUser)

    }

    return users

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


const testSeedUsers = (data) => {

    const userOne = new User(data[0]).save()
    const userTwo = new User(data[1]).save();

    return Promise.all([userOne, userTwo])

}

module.exports = { 
    articles, columns, users,
    testDelete, testSeed, testSeedUsers,
    buildArticleData, buildColumnData,
    userData
};