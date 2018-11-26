const {app} = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect, should } = require('chai')
const mongoose = require('../../db/mongoose')
const request =  require('supertest')


describe('POST /article', ()=>{
    it('create a new article', (done)=> {

        // test data
        let title = 'testTitle1'
        let url = 'www.testsite.com'

        request(app)
            .post('/article')
            .send({title, url})
            .expect(201)
            .expect(res => {
                expect(res.title).to.equal(title)
            })
            .end()
        
        ArticleLog
            .find()
            .then(data => {
                expect(data.articleSaved).to.equal(true)
                expect(data.title).to.equal(title)
                expect(data.url).to.equal(url)
                done()
            })
            .catch(done())
            
    })
})