var path = require('path');
const { app } = require(path.resolve() + '/app.js');

const Column = require(path.resolve() + '/api/models/column');
const ArticleLog = require(path.resolve() + '/api/models/articleLog');
const User = require(path.resolve() + '/api/models/user');

const { ObjectId } = require("mongoose").Types;

const {
  users,
  logInToken
} = require(path.resolve() + '/tests/seedData');

describe.only('user/logout PATCH', () => {

  it('logouts user', async () => {

    const loggedInUser = await User.findOne({ '_id':users[0]._id }).lean().exec();
    assert.equal(loggedInUser.tokens.length, 1);
    assert.equal(loggedInUser.tokens[0].token, logInToken);

    const logoutSendData = {
      email: users[0].email
    }

    const { body: {loggedOut} } = await request(app)
    .patch('/user/logout')
    .set('x-auth', logInToken)
    .send(logoutSendData)
    .expect(200);

    assert.equal(loggedOut, true);
  });

});
