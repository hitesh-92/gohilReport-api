const {app} = require('../../../app')

const mongoose = require('mongoose')
const { Types: {ObjectId}} = mongoose

const {
    articles,
    columns,
    buildArticleData,
    logInToken
} = require('../../seedData')

const Column = require('../../../api/models/column')

const request = require('supertest')
const assert = require('assert')

describe.only('column/ Routes', () => {

    describe.only('GET /', () => {
        // var start = Date.now()

        it('return all column with articles', () => {
            return request(app)
            .get('/column/')
            .expect(200)
            .then( ({
                body: {center, left, right}
            }) => {
                assert.equal(left.length, 2)
                assert.equal(center.length, 2)
                assert.equal(right.length, 2)
            })
        })

    })//GET '/'

    describe('GET /:column', () => {

        it('find column and return articles', () => {
            return request(app)
            .get('/column/right')
            .expect(200)
            .then( ({
                body: {
                    columnData,
                    articles: [savedArticle1, savedArticle2],
                    error
                }
            }) => {
                const seedColumn = columns[1]

                assert.equal(error, false)
                assert.equal(columnData._id, seedColumn._id)
                assert.equal(savedArticle1._id, articles[2]._id)
                assert.equal(savedArticle2._id, articles[3]._id)
            })
        })//

        it("not find column 'noColumn'", () => {
            return request(app)
            .get('/column/noColumn')
            .expect(400)
            .then( ({
                body: {
                    requestedColumn,
                    columnData,
                    message,
                    error
                }
            }) => {
                assert.equal(requestedColumn, 'noColumn')
                assert.equal(columnData, null)
                assert.equal(message, 'Column not found')
                assert.equal(error, true)
            })
        })

    })//GET '/:column'

    describe('POST /', () => {

        it('save new column and find it', () => {

            //create new test data
            const fakeArticleData = [
                { title: 'one', url: 'http://one.co', createdAt: '1543499785555' },
                { title: 'two', url: 'http://two.co', createdAt: '1543499786666' },
                { title: 'three', url: 'http://three.co', createdAt: '1543499787777' },
                { title: 'four', url: 'http://four.co', createdAt: '1543499788888' }
            ]
            const testArticles = buildArticleData(fakeArticleData)

            const testArticleIDs = testArticles.map(article => article._id)

            const postColumnData = {
                title: 'testTitlee',
                articleIDs: testArticleIDs
            }
        
            
            return request(app)
            .post('/column')
            .set('x-auth', logInToken)
            .set('Accept', 'application/json')
            .send(postColumnData)
            .expect(200)
            .then( async ({
                body: {
                    createdColumn: column,
                    title,
                    message
                }
            }) => {

                const id = ObjectId.createFromHexString(column._id)

                assert.equal(column.articleIDs.length, 4)
                assert.equal(title, postColumnData.title)
                assert.equal(message, 'success')

                const {
                    title: confirmTitle,
                    articleIDs: confirmArticleIDs
                } = await Column.findById(id)

                assert.equal(confirmTitle, postColumnData.title)
                assert.equal(confirmArticleIDs.length, testArticles.length)
            })

        })//

        it('reject request with bad articleId', () => {

            //create new test data
            const articleData = [
                { title: 'one', url: 'http://one.co', createdAt: '1543499785555' },
                { title: 'two', url: 'http://two.co', createdAt: '1543499786666' },
                { title: 'three', url: 'http://three.co', createdAt: '1543499787777' },
                { title: 'four', url: 'http://four.co', createdAt: '1543499788888' }
            ]
            const testArticles = buildArticleData(articleData)

            let testArticleIDs = testArticles.map(article => article._id)
            testArticleIDs.push('1234567890')

            const postColumnData = {
                title: 'testTitlee',
                articleIDs: testArticleIDs
            }

            return request(app)
            .post('/column')
            .set('x-auth', logInToken)
            .set('Accept', 'application/json')
            .send(postColumnData)
            .expect(400)
            .then( ({
                body: {
                    error,
                    saved
                }
            }) => {
                assert.equal(error.articleIDs, 'Invalid Article ID(s) provided')
                assert.equal(saved, false)
            })
        })//

    })//POST '/'

    describe('PATCH /', () => {
        
        it('update articleIDs of first seed column', () => {

            //create new articlesIDs to update
            const articleIDsData = [
                {title: 'one1', url: 'http://one1.com'},
                {title: 'two2', url: 'http://two2.com'},
                {title: 'three3', url: 'http://three3.com'},
                {title: 'four4', url: 'http://four4.com'}
            ]
            const testArticles = buildArticleData(articleIDsData)
            const testArticleIDs = testArticles.map(article => article._id)

            const sendData = {
                ids: testArticleIDs
            }

            return request(app)
            .patch('/column/left')
            .set('x-auth', logInToken)
            .set('Accept', 'application/json')
            .send(sendData)
            .expect(200)
            .then( ({
                body: {
                    newArticleIDs,
                    message
                }
            }) => {         
                assert.equal(newArticleIDs.length, 6)
                assert.equal(message, 'success')
            })

        });//

        it('return error if id(s) not found', () => {

            const sendData = {
                ids: [new ObjectId(), new ObjectId()]
            }

            return request(app)
            .patch('/column/noColumn')
            .set('x-auth', logInToken)
            .set('Accept', 'application/json')
            .send(sendData)
            .expect(404)
            .then( ({
                body: {error: {message}}
            }) => {
                assert.equal(message, 'Invalid Column Requested')
            })

        })//
        
        it('reject invalid article id', () => {

            const sendData = {
                ids: [
                    new ObjectId(),
                    new ObjectId(),
                    '5c2d0555c9d6872c78874081', //good id
                    '5c2d0555c9d6872c7887408'   //bad id
                ]
            }

            return request(app)
            .patch('/column/right')
            .set('x-auth', logInToken)
            .set('Accept', 'application/json')
            .send(sendData)
            .expect(400)
            .then( ({
                body: {error: {message}}
            }) => {
                assert.equal(message, 'Invalid article ID provided. Check entry')
            })
        })//
        

    })//PATCH '/'

    describe('DELETE /:column', () => {

        it('delete a column with 200 response status', () => {

            return request(app)
            .delete('/column/right')
            .set('x-auth', logInToken)
            .expect(200)
            .then( ({
                body: {message, deleted}
            }) => {
                assert.equal(message, 'success')
                assert.equal(deleted, true)
            })
        })//

        it('reject wrong column with 400 status', () => {

            return request(app)
            .delete('/column/noColumn')
            .set('x-auth', logInToken)
            .expect(400)
            .then( ({
                body: {message, deleted}
            }) => {
                assert.equal(message, 'Invalid Column Provided')
                assert.equal(deleted, false)
            })
        })//

    })//DELETE '/:column'
    
});//Column Routes