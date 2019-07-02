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


describe('/column/ PATCH', () => {

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
