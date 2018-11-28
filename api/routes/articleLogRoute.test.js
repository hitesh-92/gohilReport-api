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
  
    it('should return "message":"working"', () => {

      

      request(app)
        .get('/article/')
        .expect(200)
        .end((err, response) => {
          if(err) done(err)
  
          expect(response.res.text).to.equal('{"message":"working"}')
          done()
        })

    })//
  
  })// GET
  
  describe("/article POST '/'", ()=>{
  
    it('should have status 201', ()=>{

      let title = 'return201'
      let url = 'www.201.com'

      // request(app)
      //   .post('article/')
      //   .send({
      //     title: 'status(201)',
      //     url: 'www.201.com'
      //   })
      //   .expect(201)
      //   .end(done())

      return request(app)
        .post('/article/')
        .send({title, url})
        .expect(201)
        .then(res => {
          expect(res.body.articleSaved).to.be.true
        })
        .catch(e => console.log(e))



    })//
  
    it('return 400 if bad data sent', () => {

      let title = false
      let url = undefined

      // request(app)
      //   .post('article/')
      //   .send({
      //     title: true, 
      //     url: false
      //   })
      //   .expect(400)
      //   .end(done())

      return request(app)
        .post('/article/')
        .send({title, url})
        .expect(400)
        .then(res => {
          expect(res.body.articleSaved).to.be.false
        })
        .catch(e => console.log(e))


    })//
  
    it('should have response with articleSaved: true', ()=>{

      // const data = {
      //   title: 'articleSaved:true',
      //   url: 'www.test.com'
      // }

      let title = 'articleSaved:true'
      let url = 'www.test.com'

      return request(app)
        .post('/article/')
        .send({title, url})
        .then(res => {
          expect(res.body.articleSaved).to.be.true

        }).catch((e) => console.log(e))

      // request(app)
      //   .post(`/article/`)
      //   .send({title, url})
      //   .expect(201)
      //   .expect(res => {
      //     let saved = res.body.articleCreated
      //     assert.ok(saved === true)
      //     expect(saved).to.be.true
      //   })
      //   .end(done())

    })//
  
    it('save new Article, find in db using response _id', ()=>{

      // let title = 'found using _id'
      // let url = 'www.sameple.com'
      // let articleId;

      // return request(app)
      //     .post('/article/')
      //     .send({title, url})
      //     .then(res => {
      //       assert(res.body.articleSaved == true)

      //       articleId =  res.body.createdArticle._id

      //       ArticleLog
      //         .findById(articleId)
      //         .then(log => {
      //           // assert.ok(log.title == title)
      //           // assert.ok(log.url == url)
      //           expect(log.title).to.equal(title)
      //           expect(log.url).to.equal(url)
      //         })
      //     })

      // return request(app)
      //   .post('/article/')
      //   .send({title,url})
      //   .then((res) => {
      //     // if(err) return err

      //     console.log(res.body)
      //     assert(res.body.createdArticle._id.length == 24)
      //   })


    })//

    /*
    it('response should have correct createdArticle', ()=>{})
    */

    it('should pass', ()=>{
      expect(true).to.be.true
    })
  
  })//POST

})//articleLog Route

