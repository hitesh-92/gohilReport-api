const {app} =  require('../../../app')

const request = require('supertest')
const assert = require('assert')

const { users } = require('../../seedData')

describe("user/ Routes", () => {

    describe("POST /signup" , () => {

        it('saves new user', () => {

            const userData = {
                email: 'random@email.com',
                password: 'needs10chars'
            }
            
            return request(app)
            .post('/user/signup/')
            .send(userData)
            .expect(200)
            .then( ({
                body:   {email, added}
            }) => {
                assert.equal(email, userData.email)
                assert.equal(added, true)
            })

        })//

        it('reject bad password', () => {

            const userData = {
                email: 'random@emai.com',
                password: '123'
            }

            return request(app)
            .post('/user/signup/')
            .send(userData)
            .expect(400)
            .then( ({
                body:   {added}
            }) => {
                assert.equal(added, false)
            })

        })//
    })//

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
            .then( ({
                header,
                body:   {loggedIn}
            }) => {
                assert.equal(header['x-auth'].length > 15, true)
                assert.equal(loggedIn, true)
            })

        })//

        it('reject bad login details', () => {

            const userData = {
                email: users[0].email,
                password: 'password'
            }

            return request(app)
            .post('/user/login')
            .send(userData)
            .expect(400)
            .then( ({
                body: {loggedIn}
            }) => {
                assert.equal(loggedIn, false)
            })

        })//

    })//

})// user/ Routes

