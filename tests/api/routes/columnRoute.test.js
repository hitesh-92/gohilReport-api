const {app} =  require('../../../app')

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

        it('work', () => {
            return request(app)
            .get('/column/')
            .expect(200)
            .then(res => {
                assert.equal(res.body.title, 'ColumnTitle')
            })
        })
    })
    

});//Column Routes