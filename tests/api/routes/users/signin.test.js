var path = require('path');
const { app } = require(path.resolve() + '/app.js');

const Column = require(path.resolve() + '/api/models/column');
const ArticleLog = require(path.resolve() + '/api/models/articleLog');

const { ObjectId } = require("mongoose").Types;
const moment = require('moment');

const {
  users,
  logInToken
} = require(path.resolve() + '/tests/seedData');

describe("/user/signup POST", () => {

  it('saves new user', () => {

    const userData = {
      email: 'random@email.com',
      password: 'needs10chars'
    }

    return request(app)
      .post('/user/signup/')
      .send(userData)
      .expect(200)
      .then(({
        body: {
          email,
          added
        }
      }) => {
        assert.equal(email, userData.email)
        assert.equal(added, true)
      })

  });

  it('reject bad password', () => {

    const userData = {
      email: 'random@emai.com',
      password: '123'
    }

    return request(app)
      .post('/user/signup/')
      .send(userData)
      .expect(400)
      .then(({
        body: {
          added
        }
      }) => {
        assert.equal(added, false)
      })

  });

});
