var path = require('path');
const { app } = require(path.resolve() + '/app.js');

const Column = require(path.resolve() + '/api/models/column');
const ArticleLog = require(path.resolve() + '/api/models/articleLog');

const { ObjectId } = require("mongoose").Types;
const moment = require('moment');

const {
  articles,
  logInToken,
  columnIds: [
    leftColumnId,
    centerColumnId,
    rightColumnId,
    archiveColumnId
  ]
} = require(path.resolve() + '/tests/seedData');

describe('/column/ GET ', () => {

  it('return all column with articles', async () => {

    var {
      body: {
        left,
        center,
        right,
        alert
      }
    } = await request(app)
      .get('/column/')
      .expect(200);


    let totalArticleCount = (
      left.length + center.length + right.length + alert.length
    );

    assert.equal(totalArticleCount, 8);

    var [
      left1, , center1, center2, right1, right2, , , alert1
    ] = articles;

    assert.equal(left[0].title, left1.title);
    assert.equal(center[0].status, center1.status)
    assert.equal(center[1].url, center2.url);
    assert.equal(right[0].image, right1.image);
    assert.equal(right[1].position, right2.position);
    assert.equal(alert[0].createdAt, alert1.createAt);

  });

});

describe('/column/:title GET', () => {

  it('find column and return articles', async () => {
    const {
      body: {
        error,
        articles
      }
    } = await request(app)
      .get('/column/left')
      .set('x-auth', logInToken)
      .expect(200);

    assert.equal(error, false)
    assert.equal(articles.length, 2)
  });

  it("not find invalid column", async () => {
    const {
      body: {
        columnData,
        message,
        error
      }
    } = await request(app)
      .get('/column/badColumn')
      .set('x-auth', logInToken)
      .expect(400);

    assert.equal(columnData, null)
    assert.equal(message, 'Column not found')
    assert.equal(error, true)
  });

  it('find all archive articles', async () => {

    const {
      body: {
        columnData,
        error,
        articles
      }
    } = await request(app)
      .get('/column/archive')
      .set('x-auth', logInToken)
      .expect(200)

    assert.equal(error, false);
    assert.equal(articles.length, 2);
    assert.equal(columnData.title, 'archive');

  });

  it('returns archives in descending order form newest', async () => {

    var dates = [
      moment().add(1, 'm'),
      moment().add(2, 'm')
    ];

    const x = await ArticleLog.create({
      _id: new ObjectId(),
      title: 'put me second',
      url: 'www.Secondddd.com',
      image: null,
      column: archiveColumnId,
      position: null,
      createdAt: dates[0],
      updatedAt: dates[0],
      status: 0,
      __v: 0
    }, {
      _id: new ObjectId(),
      title: 'put me firsttt',
      url: 'www.Firsttttt.com',
      image: null,
      column: archiveColumnId,
      position: null,
      createdAt: dates[1],
      updatedAt: dates[1],
      status: 0,
      __v: 0
    });

    const {
      body: {
        articles,
        error
      }
    } = await request(app)
    .get('/column/archive')
    .set('x-auth', logInToken)
    .expect(200)

    assert.equal(articles[0].title, 'put me firsttt');
    assert.equal(articles[1].title, 'put me second');
  });

  it('archiving article with highest position', async () => {

    const sendData = {
      title: 'testTitleeee',
      url: 'www.testtt.com',
      image: 'www.test-imagee.com',
      column: leftColumnId,
      position: 1
    };

    const { body: { createdArticle: article } } = await request(app).post('/article/').send(sendData).set('x-auth', logInToken).expect(201);

    const preArchive = await ArticleLog.find({'column':leftColumnId}).sort({position: 1}).exec();

    const { body } = await request(app).post('/article/archive').send({id: article._id}).set('x-auth', logInToken)//.expect(200);

    const archives = await ArticleLog.find({'column':archiveColumnId}).sort({createdAt: -1}).exec();

    const left = await ArticleLog.find({'column':leftColumnId}).sort({position: 1}).exec();

  });

});

describe('/column/ids GET', () => {

  it('responds with column ids and titles', async () => {

    const {
      body: {
        columns
      }
    } = await request(app)
      .get('/column/ids')
      .set('x-auth', logInToken)
      .expect(200);

    assert.equal(typeof columns, 'object');
    assert.equal(columns.length > 0, true);
  });

  it('number of articles in each column included', async () => {

    await ArticleLog.create({
      _id: new ObjectId(),
      title: 'fooo',
      url: 'barrr',
      position: 3,
      column: rightColumnId
    });

    const {
      body: {
        columns: [ left, center, right, archive, alert ]
      }
    } = await request(app)
    .get('/column/ids')
    .set('x-auth', logInToken)
    .expect(200);

    assert.equal(left.count, 2);
    assert.equal(right.count, 3);
    assert.equal(archive.count, 2);

  });

});
