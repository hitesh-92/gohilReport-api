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
    })

    describe.only('GET /:column', () => {

        it('find column and return articles using column.articleIDs', () => {
            return request(app)
            .get('/column/right')
            .expect(200)
            .then(response => {
                const res = response.body

                // correct column
                const requestedColumn = res.requestedColumn
                assert.equal(requestedColumn, 'right')

                // both articles retrieved
                const columnIDs = res.columnData.articleIDs
                assert.equal(columnIDs[0], res.articles[0]._id)
                assert.equal(columnIDs[1], res.articles[1]._id)

                
            })
        })

        it("fail to find column 'noColumn'", () => {
            return request(app)
            .get('/column/noColumn')
            .expect(404)
            .then(response => {
                const res = response.body

                assert.equal(res.requestedColumn, 'noColumn')
                assert.equal(res.columnData, null)
                assert.equal(res.message, 'Column not found')
            })
        })

    })
    
});//Column Routes