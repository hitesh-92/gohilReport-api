const {
  app
} = require('../../../app');

const {
  Types: {
    ObjectId
  }
} = require('mongoose');

const {
  articles,
  columnIds: [
    leftColumnId,
    centerColumnId,
    rightColumnId
  ],
  logInToken
} = require('../../seedData');

const Column = require('../../../api/models/column');

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
      console.log(left)
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
        .expect(400);

      assert.equal(columnData, null)
      assert.equal(message, 'Column not found')
      assert.equal(error, true)
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
            title,
            message,
            saved
          }
        }) => {

          const id = ObjectId.createFromHexString(column._id)

          assert.equal(title, postColumnData.title)
          assert.equal(message, 'success')
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
        title: ''
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
          column: {
            nModified
          }
        }
      } = await request(app)
        .patch('/column/')
        .set('x-auth', logInToken)
        .set('Accept', 'application/json')
        .send(sendData)
        .expect(200)

      assert.equal(nModified, 1)

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
        id: new ObjectId()
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
