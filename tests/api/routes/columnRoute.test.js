const {app} =  require('../../../app')
const mongoose = require('mongoose')

const request = require('supertest')
const {expect} = require('chai')
const assert = require('assert')

const {articles, columns, testDelete, testSeed} = require('../../seedData')

const ArticleLog = require('../../../api/models/articleLog')
const Column = require('../../../api/models/column')


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

    describe.only('GET /:column', () => {

        it('find column and return articles using column.articleIDs', () => {
            return request(app)
            .get('/column/right')
            .expect(200)
            .then(response => {
                let res = response.body
                console.log(res)


                /* FIRST
                assert.equal(res.requestedColumn, 'right')
                */

                /* SECOND / THIRD
                assert.equal(res.requestedColumn, 'right')
                assert.equal(res.message, 'success')
                assert.equal(res.error, false)
                */

                /* FOURTH */
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
            })
        })

    })//GET '/:column'
    
});//Column Routes