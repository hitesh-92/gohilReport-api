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
                const body = response.body
                const header = response.header

                assert.equal(typeof header['x-auth'], 'string')
                assert.equal(body.email, userData.email)
                assert.equal(body.added, true)
            })

        })

    })// POST /signup

})// user/ Routes

