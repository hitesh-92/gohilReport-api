const {app} = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect, should } = require('chai')
const mongoose = require('../../db/mongoose')
const request =  require('supertest')
const assert = require('assert')



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

})

describe("/article POST '/'", ()=>{

  it('should have status 201', (done)=>{
    request(app)
      .post('article/')
      .send({
        title: 'testTitle',
        url: 'www.test.com'
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

  it('should have response with articleSaved: true', (done)=>{
    request(app)
      .post('/article/')
      .send({
        title: 'testTitle',
        url: 'www.test.com'
      })
      .expect(res => {
        expect(res.articleSaved).to.equal(true)
      })
      .end(done())
  })

})