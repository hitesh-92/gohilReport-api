const User = require('../../../api/models/user')
const ObjectId = require('mongoose').Types.ObjectId

describe('MODEL user', () => {

    it('create new user', () => {

        const usrEmail = 'user@email.com'
        const usrPasswrd = 'go0dPassword'

        const testUsr = new User({
            _id: new ObjectId(),
            email: usrEmail,
            password: usrPasswrd
        })

        assert.equal(testUsr.email, usrEmail)
        assert.equal(testUsr.password, usrPasswrd)
        assert.equal(ObjectId.isValid(testUsr._id), true)

    })

});