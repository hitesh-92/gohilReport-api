const User = require('../../../api/models/user')
const mongoose = require('mongoose')

const ObjectId = mongoose.Types.ObjectId

// const {ObjectId} = require('mongoose')

const assert = require('assert')

describe('MODEL user', () => {

    it('create new user', () => {

        const usrEmail = 'user@email.com'
        const usrPasswrd = 'go0dPassword'

        const testUsr = new User({
            _id: new mongoose.Types.ObjectId(),
            email: usrEmail,
            password: usrPasswrd
        })

        assert.equal(testUsr.email, usrEmail)
        assert.equal(testUsr.password, usrPasswrd)
        assert.equal(ObjectId.isValid(testUsr._id), true)

    })

});