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
            // .end((err, res) => {
            //     if(err) return done(err)

            //     expect(res.added).to.equal(true);

            //     // console.log('res:',res)

            //     // ArticleLog
            //     //     .find({title: 'testTitle'})
            //     //     .then(article => {
            //     //         expect(article.length).to.equal(1)
            //     //         done()
            //     //     })
            //     //     .catch(e =>done(e) )
                
            // });
            .end()
        
        ArticleLog
            .find()
            .then(data => {
                expect(data.articleSaved).to.equal(true)
                done()
            })
            .catch(done())
            
    })
})