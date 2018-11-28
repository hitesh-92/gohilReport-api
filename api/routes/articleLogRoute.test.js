const {app} = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect } = require('chai')
const mongoose = require('../../db/mongoose')
const request =  require('supertest')
const assert = require('assert')

describe("articleLog Routes", ()=>{

  describe("GET '/article/'", ()=>{

    // '/' should retrieve all logs to be displayed

    it('should return status 200', function(){

      return request(app)
        .get('/article/')
        .expect(200)

    })
  
    it('should return "message":"working"', () => {

      return request(app)
        .get('/article/')
        .then(res => {
          expect(res.body.message).to.equal('working')
        })
        .catch(e => console.log(e))

    })//
  
  })// GET
  
  describe("POST '/article/'", ()=>{

    it('should have status 201', ()=>{

      let title = 'return201'
      let url = 'www.201.com'

      return request(app)
        .post('/article/')
        .send({title, url})
        .expect(201)
        .then(res => {
          expect(res.body.articleSaved).to.be.true
        })
        .catch(e => console.log(e))

    })//
  
    it('send bad data; status 400 and articleSaved to be false', () => {

      let title = false
      let url = undefined

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

      let title = 'articleSaved:true'
      let url = 'www.test.com'

      return request(app)
        .post('/article/')
        .send({title, url})
        .then(res => {
          expect(res.body.articleSaved).to.be.true

        }).catch((e) => console.log(e))

    })//
  
    it('save new Article, find in db using response _id', ()=>{

      let title = 'found using _id'
      let url = 'www.findMyID.com'
      let articleId;

      return request(app)
        .post('/article/')
        .send({title, url})
        .then(res => {
          articleId = res.body.createdArticle._id
          expect(articleId).to.have.lengthOf(24)

          ArticleLog
            .findById(articleId)
            .then(log => {
              expect(log.title).to.equal(title)
              expect(log.url).to.equal(url)
            })
            .catch(e => console.log(e))

        })
        .catch(e =>  console.log(e))

    })//

  })//POST

})//articleLog Route

