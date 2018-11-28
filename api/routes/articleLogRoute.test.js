const {app} = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect } = require('chai')
const mongoose = require('../../db/mongoose')
const request =  require('supertest')
const assert = require('assert')



describe("articleLog Route", ()=>{

  describe("/article GET '/'", ()=>{

    it('should return status 200', function(done){
      request(app)
        .get("/article")
        .expect(200)
        .end( function(err, res){
          if(err) done(err)
        done()
      })
    })
  
    it('should return "message":"working"', (done) => {
      request(app)
        .get('/article/')
        .expect(200)
        .end((err, response) => {
          if(err) done(err)
  
          expect(response.res.text).to.equal('{"message":"working"}')
          done()
        })
    })
  
  })// GET
  
  describe("/article POST '/'", ()=>{
  
    it('should have status 201', (done)=>{
      request(app)
        .post('article/')
        .send({
          title: 'status(201)',
          url: 'www.201.com'
        })
        .expect(201)
        .end(done())
    })
  
    it('return 400 if bad data sent', (done) => {
      request(app)
        .post('article/')
        .send({
          title: true, 
          url: false
        })
        .expect(400)
        .end(done())
    })
  
    it('should have response with articleSaved: true', ()=>{
      return request(app)
        .post('/article/')
        .send({
          title: 'articleSaved:true',
          url: 'www.test.com'
        })
        .expect(201)
        .then(res =>{
          // console.log('***res***\n', res.body)
          const log = res.body

          expect(log.articleSaved).to.be.true;

        })
        .catch(console.log)
    })
  
    it('save new Article, use article _id to find in db', ()=>{

      let title = 'found using _id'
      let url = 'www.sameple.com'
      let articleId;

      return request(app)
        .send({
          title, url
        })
        .then(res => {

        })
        .catch(console.log)
  
      

    })

    it('response should have correct createdArticle', ()=>{
/*      let title = 'Test Title'
      let url = 'http://www.testing-website.com'

      request(app)
        .post('/article/')
        .send({ title, url })
        .expect(201)
        .expect(res => {
          expect(res.title).to.equal(title)
          expect(res.url).to.equal(title)
          expect(res.createdAt).to.have.lengthOf(12)
          expect(typeof res._id).to.equal('object')
        })
        .end(done())
*/
    })

    // it('should fail', ()=>{
    //   expect(true).to.be.false
    // })
  
  })//POST

})//articleLog Route

