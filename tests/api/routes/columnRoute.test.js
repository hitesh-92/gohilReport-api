const {app} =  require('../../../app')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const request = require('supertest')
const {expect} = require('chai')
const assert = require('assert')

const {
    articles,
    columns,
    testDelete,
    testSeed,
    buildArticleData
} = require('../../seedData')

const ArticleLog = require('../../../api/models/articleLog')
const Column = require('../../../api/models/column')

//TEST FOR DUPLICATE ENTRIES IN POST ROUTES

/*
    HOOKS
*/
beforeEach( () => testDelete(ArticleLog) )
beforeEach( () => testSeed(ArticleLog, articles) )

beforeEach( () => testDelete(Column) )
beforeEach( () => testSeed(Column, columns) )


describe('column/ Routes', () => {

    describe('GET /', () => {

        it('return message', () => {
            return request(app)
            .get('/column/')
            .expect(200)
            .then(res => {
                assert.equal(res.body.message, 'Please select column')
            })
        })
    })//GET '/'

    describe('GET /:column', () => {

        it('find column and return articles', () => {
            return request(app)
            .get('/column/right')
            .expect(200)
            .then(response => {
                let res = response.body

                const seedColumn = columns[1]

                assert.equal(res.error, false)

                //response columnData id matches seeded column data
                assert.equal(seedColumn._id, res.columnData._id)

                //response article ids match seeded articles
                assert.equal(res.articles[0]._id, articles[2]._id)
                assert.equal(res.articles[1]._id, articles[3]._id)

            })
        })//

        it("not find column 'noColumn'", () => {
            return request(app)
            .get('/column/noColumn')
            .expect(400)
            .then(response => {

                const res = response.body

                assert.equal(res.requestedColumn, 'noColumn')
                assert.equal(res.columnData, null)
                assert.equal(res.message, 'Column not found')
                assert.equal(res.error, true)
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
            const testArticles = buildArticleData(ArticleLog, ObjectId, fakeArticleData)

            const testArticleIDs = testArticles.map(article => article._id)

            const postColumnData = {
                title: 'testTitlee',
                articleIDs: testArticleIDs
            }

            //post with data
            return request(app)
            .post('/column/')
            .send(postColumnData)
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {

                const res = response.body
                const column = res.createdColumn

                //test response
                assert.equal(column.articleIDs.length, 4)
                assert.equal(res.title, postColumnData.title)
                assert.equal(res.message, 'success')

                //search for column using newly created column id from response
                const id = ObjectId.createFromHexString(column._id)

                Column.findById(id)
                .then(savedColumn => {
                    
                    //make sure data is same as test data
                    assert.equal(savedColumn.title, postColumnData.title)
                    assert.equal(savedColumn.articleIDs.length, testArticles.length)

                })
            })

        })//

        /* TEST FOR ERROR(S) */

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
            const testArticles = buildArticleData(ArticleLog, ObjectId, articleIDsData)
            const testArticleIDs = testArticles.map(article => article._id)

            const sendData = {
                ids: testArticleIDs
            }
            
            return request(app)
            .patch('/column/left')
            .send(sendData)
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                const res = response.body                
                // console.log('---\n', res)

                //return updatedColumn, msg:success, error:false,
                assert.equal(res.newArticleIDs.length, 6)
                assert.equal(res.message, 'success')

            })

        });//

        it('should return 404 if column not found', () => {

            //create data to send
            const sendData = {
                ids: [new ObjectId()]
            }

            return request(app)
            .patch('/column/noColumn')
            .send(sendData)
            .set('Accept', 'application/json')
            .expect(404)
            .then(response => {
                const res = response.body
                assert.equal(res.error.message, 'Invalid Column Requested')
            })

        })//
        
        it('should return 400 if bad data sent', () => {

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
            .send(sendData)
            .set('Accept', 'application/json')
            .expect(400)

        })//

    })//PATCH '/'

    describe('DELETE /:column', () => {

        it('delete a column with 200 response status', () => {

            return request(app)
            .delete('/column/right')
            .expect(200)
            .then(response => {
                const res = response.body

                assert.equal(res.message, 'success')
                assert.equal(res.deleted, true)

            })

        })//

        it('reject wrong column with 400 status', () => {

            return request(app)
            .delete('/column/noColumn')
            .expect(400)
            .then(response => {
                const res = response.body

                assert.equal(res.message, 'Invalid Column Provided')
                assert.equal(res.deleted, false)

            })

        })//

    })//DELETE '/:column'
    
});//Column Routes