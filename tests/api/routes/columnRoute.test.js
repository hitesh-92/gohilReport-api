const {
  app
} = require('../../../app');

const {
  Types: {
    ObjectId
  }
} = require('mongoose');

const moment = require('moment');

const {
  articles,
  columnIds: [
    leftColumnId,
    centerColumnId,
    rightColumnId,
    archiveColumnId
  ],
  logInToken
} = require('../../seedData');

const Column = require('../../../api/models/column');
const ArticleLog = require('../../../api/models/articleLog');

describe('column/ ', () => {

  describe('GET /', () => {

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

  describe('GET /:title', () => {

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

  describe('GET /ids', () => {

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

    it.only('number of articles in each column included', async () => {

      const {
        body: {
          columnData: [ left, center, right, archive, alert ]
        }
      } = await request(app)
      .get('/column/ids')
      .set('x-auth', logInToken)
      .expect(200);

      assert.equal(left.count, 2);
      assert.equal(right.count, 2);
      assert.equal(archive.count, 2);

    });

  });

  describe('POST /', () => {

    it('save new column and find it', () => {

      const postColumnData = {
        title: 'testTitlee'
      }

      return request(app)
        .post('/column')
        .set('x-auth', logInToken)
        .set('Accept', 'application/json')
        .send(postColumnData)
        .expect(200)
        .then(async ({
          body: {
            column,
            saved
          }
        }) => {

          const id = ObjectId.createFromHexString(column._id)

          assert.equal(saved, true)

          const {
            title: savedTitle
          } = await Column.findById(id)
            .select('title')
            .exec()

          assert.equal(savedTitle, postColumnData.title)
        })

    })

    it('reject request with bad articleId', () => {

      const postColumnData = {
        title: '     '
      }

      return request(app)
        .post('/column')
        .set('x-auth', logInToken)
        .set('Accept', 'application/json')
        .send(postColumnData)
        .expect(400)
        .then(({
          body: {
            error,
            saved
          }
        }) => {
          assert.equal(saved, false)
          assert.equal(error, 'Invalid title')
        })
    })

  });

  describe('PATCH /', () => {

    it('updates single column document', async () => {

      const sendData = {
        id: leftColumnId,
        title: 'updateMeee'
      }

      const {
        body: {
          // column: {
          //   nModified
          // }
          updated
        }
      } = await request(app)
        .patch('/column/')
        .set('x-auth', logInToken)
        .set('Accept', 'application/json')
        .send(sendData)
        .expect(200)

      assert.equal(updated, true)

      const {
        title,
        createdAt,
        updatedAt
      } = await Column.findOne({
          _id: leftColumnId
        })
        .select('title createdAt updatedAt')
        .exec()

      assert.equal(title, sendData.title)
      assert.notEqual(createdAt, updatedAt)
    });

    it('reject invalid column id', async () => {

      const sendData = {
        id: '123456789',
        title: 'newTitle'
      }

      const {
        body: {
          error
        }
      } = await request(app)
        .patch('/column/')
        .set('x-auth', logInToken)
        .set('Accept', 'application/json')
        .send(sendData)
        .expect(400)

      assert.equal(error, 'Invalid id')
    })

    it('reject if no column found', async () => {

      const sendData = {
        id: new ObjectId(),
        title:'1234567'
      }

      const {
        body: {
          error
        }
      } = await request(app)
        .patch('/column/')
        .set('x-auth', logInToken)
        .set('Accept', 'application/json')
        .send(sendData)
        .expect(400)

      assert.equal(error, 'No column with given id found')
    })


  });

  describe('DELETE /:column', () => {

    it('delete single column', async () => {

      const {
        body: {
          deleted,
          message
        }
      } = await request(app)
        .delete('/column/')
        .set('x-auth', logInToken)
        .send({
          id: leftColumnId
        })
        .expect(200)

      assert.equal(message, 'success')
      assert.equal(deleted, true)
    })

    it('reject invalid column', async () => {

      const badColumnId = new ObjectId();

      const {
        body: {
          deleted,
          message
        }
      } = await request(app)
        .delete('/column/')
        .set('x-auth', logInToken)
        .send({
          id: badColumnId
        })
        .expect(400)

      assert.equal(message, 'Invalid Column Provided')
      assert.equal(deleted, false)
    })
  });

});
