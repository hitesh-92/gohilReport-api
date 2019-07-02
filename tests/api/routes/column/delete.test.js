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


describe('/column/:title DELETE', () => {

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
