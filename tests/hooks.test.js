const ArticleLog = require('../api/models/articleLog')
const User = require('../api/models/user')
const Column = require('../api/models/column')

const {
    testDelete,
    testSeed,
    articles,
    columns,
    testSeedUsers,
    users
} = require('./seedData')

//DELETE DATA
beforeEach( () => testDelete(ArticleLog) )
beforeEach( () => testDelete(User) )
beforeEach( () => testDelete(Column) )

//SEED DATA
beforeEach( () => testSeed(ArticleLog, articles) )
beforeEach( () => testSeed(Column, columns) )
beforeEach( () => testSeedUsers(users) )