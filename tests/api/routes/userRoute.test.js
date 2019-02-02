const User = require('../../../api/models/user')
const {app} =  require('../../../app')

const request = require('supertest')
const assert = require('assert')

/*
    HOOKS
*/

//

describe.only("user/ Routes", () => {

    describe("POST /signup" , () => {

        it('saves new user', () => {

            const r = Date.now()
            const email = `${r}@email.com`

            const userData = {
                email,
                password: 'needs10chars'
            }
            
            return request(app)
            .post('/user/signup/')
            .send(userData)
            .expect(200)
            .then(response => {
                const res = response.body

                assert.equal(res.email, userData.email)
                assert.equal(res.added, true)
            })

        })

    })// POST /signup

})// user/ Routes

