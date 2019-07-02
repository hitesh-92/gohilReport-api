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

describe('/column/ POST', () => {

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
