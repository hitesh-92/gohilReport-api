const {app} =  require('../../../app')

const request = require('supertest')
const assert = require('assert')

const { users } = require('../../seedData')

describe("user/ Routes", () => {

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

                // console.log(header)
                // assert.equal(typeof(header['x-auth']), 'string')

                assert.equal(body.email, userData.email)
                assert.equal(body.added, true)
            })

        });

    })// /signup

    describe("POST /login", () => {

        it('login user', () => {

            const testUser = {
                email: users[0].email,
                password: users[0].password
            }

            return request(app)
            .post('/user/login')
            .send(testUser)
            .expect(200)
            .then(response => {
                const header = response.header
                const body = response.body

                assert.equal(header['x-auth'].length > 15, true)
                assert.equal(body.loggedIn, true)
            })

        })//

    })// /login

})// user/ Routes

