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

describe("/user/login POST", () => {

  it('login user', () => {

    const testUser = {
      email: users[1].email,
      password: users[1].password
    }

    return request(app)
      .post('/user/login')
      .send(testUser)
      .expect(200)
      .then(({
        header,
        body: {
          loggedIn
        }
      }) => {
        assert.equal(loggedIn, true)
      })

  });

  it('reject bad login details', () => {

    const userData = {
      email: users[1].email,
      password: 'password'
    }

    return request(app)
      .post('/user/login')
      .send(userData)
      .expect(400)
      .then(({
        body: {
          loggedIn
        }
      }) => {
        assert.equal(loggedIn, false)
      })

  });

  it.only('refreshes token if user already logged in', async () => {

    const {
      body: {
        token
      }
    } = await request(app)
    .post('/user/login')
    .set('x-auth', logInToken)
    .expect(400)

    assert.equal(typeof token, 'string');


  });

});
