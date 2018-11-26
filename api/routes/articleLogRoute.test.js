const {app} = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect, should } = require('chai')
const mongoose = require('mongoose')
const request =  require('supertest')


describe('POST /article', ()=>{
    it('create a new article', (done)=> {

        const newArticle = new ArticleLog({
            _id: mongoose.Types.ObjectId(),
            title: 'testTitle',
            url: 'www.testsite.com'
        })

        return request(app)
            .post('/article')
            .send({newArticle})
            .expect(201)
            .end((err, res) => {
                if(err) return done(err)

                ArticleLog.findById(newArticle._id)
                    .then(article => {
                        expect(article.title).to.equal(newArticle.title)
                        expect(article.url).to.equal(newArticle.url)
                        expect(article.createdAt).to.have.lengthOf(13)
                        done()
                    }).catch(e => done(e));
            });

        

        // ArticleLog.findById(newArticle._id).then(data => {
        //     expect(data.title).to.equal('testTitle')
        // })
    })
})