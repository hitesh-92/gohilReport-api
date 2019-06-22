const User = require('../../../api/models/user')
const ObjectId = require('mongoose').Types.ObjectId

describe('MODEL user', () => {

  it('create new user', async () => {

    const usrEmail = 'user@email.com'
    const usrPasswrd = 'go0dPassword'

    const newuser = new User({
      _id: new ObjectId(),
      email: usrEmail,
      password: usrPasswrd
    })

    let user = await newuser.save();

    assert.equal(user.email, usrEmail);
    assert.equal(typeof user.password, 'string');
    assert.equal(ObjectId.isValid(user._id), true);
    assert.equal(typeof user.createdAt, 'object');
    assert.equal(typeof user.updatedAt, 'object');
    assert.equal(user.tokens.length, 0)

  })

});