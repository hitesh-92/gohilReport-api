console.log('\x1Bc');

global.assert = require('assert'); // !
global.request = require('supertest'); // !

const ArticleLog = require('../api/models/articleLog');
const User = require('../api/models/user');
const Column = require('../api/models/column');

const {
  testDelete,
  testSeed,
  articles,
  columns,
  testSeedUsers,
  users
} = require('./seedData');

beforeEach(async () =>
  await Promise.all([
    testDelete(ArticleLog),
    testDelete(User),
    testDelete(Column)
  ]));

beforeEach(async () =>
  await Promise.all([
    testSeed(Column, columns),
    testSeed(ArticleLog, articles),
    testSeedUsers(users)
  ]));
