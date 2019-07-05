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

describe('user/logout PATCH', () => {

  it('logouts user', async () => {

    const loggedInUser = await User.findOne({ '_id':users[0]._id }).lean().exec();
    assert.equal(loggedInUser.tokens.length, 1);
    assert.equal(loggedInUser.tokens[0].token, logInToken);

    const logoutData = {
      email: users[0].email
    }

    const {
      body: { loggedOut }
    } = await user_logout(logInToken, logoutData, 200);
    assert.equal(loggedOut, true);
  });

  it('rejects if email not matched', async () => {

    const logoutData = {
      email: 'fakemail@mail.com'
    };

    const {
      body: { loggedOut }
    } = await user_logout(logInToken, logoutData, 400);

    assert.equal(loggedOut, false);

  });

  it('rejects if no email provided', async () => {

    const {
      body: { error }
    } = await user_logout(logInToken, {}, 400);

    assert.equal(error, 'Invalid Email');

  });

});

async function user_logout(authToken, sendData, expect){
  return request(app)
  .patch('/user/logout')
  .set('x-auth', authToken)
  .send(sendData)
  .expect(expect);
}
