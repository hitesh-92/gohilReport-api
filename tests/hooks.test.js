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


// Delete all collections
beforeEach( async () => await testDelete(ArticleLog) )
beforeEach( async () => await testDelete(User) )
beforeEach( async () => await testDelete(Column) )

// Seed db
beforeEach( async () => await testSeed(ArticleLog, articles) )
beforeEach( async () => await testSeed(Column, columns) )
beforeEach( async () => await testSeedUsers(users) )
