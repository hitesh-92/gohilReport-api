const {app} =  require('../../../app')
const ArticleLog = require('../../../api/models/articleLog')
const request = require('supertest')
const {expect} = require('chai')
const assert = require('assert')
const {articles, testDelete, testSeed} = require('../../seedData')

/* 
  HOOOKS 
  resolved test bug
  split into seperate functions
*/
beforeEach( () => testDelete(ArticleLog) )
beforeEach( () => testSeed(ArticleLog, articles) )

describe("article/ Routes", ()=>{   

  describe("GET /", ()=>{
  
      // '/' should retrieve all logs to be displayed
  
      it('should return status 200', ()=>{
  
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
  
      })//
    
  })// GET

  describe("GET /:articleId", ()=>{

    it('retrieve saved ArticleLog using _id', ()=>{

      const id = articles[0]._id
      const hex_id = id.toHexString()
      const uri = `/article/${hex_id}`

      return request(app)
        .get(uri)
        .expect(200)

    })//

    it('send bad ID get back 404status and found:false', ()=>{

      const badID = '123456'

      return request(app)
        .get(`/article/${badID}`)
        .then(response => {
          const res = response.body

          //found propery should be null
          assert.equal(res.found, null)

          //returns the id used when making request
          expect(res.requestId).to.equal(badID)

        })
    })//

  })//GET /:articleLogID
  
  describe("POST /", ()=>{

    it('should have status 201', ()=>{

      //http 201 status for created

      let title = 'return201'
      let url = 'www.201.com'

      return request(app)
        .post('/article/')
        .send({title, url})
        .expect(201)
        .then(res => {

          //articlSaved property will be if successful
          expect(res.body.articleSaved).to.be.true

        })

    })//
  
    it('send bad data; status 400 and articleSaved to be false', () => {
      
      //send object with values not strings
      //parsed they should be rejected

      let title = false
      let url = undefined

      return request(app)
        .post('/article/')
        .send({title, url})
        .expect(400)
        .then(res => {

          //response will have articleSaved set to false
          expect(res.body.articleSaved).to.be.false
        })

    })//
  
    it('should have response with articleSaved: true', ()=>{

      // articleSaved property, easy to test if article has been saved

      let title = 'articleSaved:true'
      let url = 'www.test.com'

      return request(app)
        .post('/article/')
        .send({title, url})
        .then(res => {

          //successful request will have articleSaved set to true
          expect(res.body.articleSaved).to.be.true

        })

    })//
  
    it('save new Article, find in db using response _id', ()=>{

      //send request to create new ArticleLog
      //get _id from response
      //use _id to search database for record
      //if successful ensure title,url are the same

      const title = 'found using _id'
      const url = 'www.findMyID.com'
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

        })

    })//

  })//POST

  describe("DELETE /:articleId", ()=>{

    it('should delete exisitng article', ()=>{

      //response has property 'deleted' which is true

      const articleId = articles[1]._id
      const hexID = articleId.toHexString()

      return request(app)
        .delete(`/article/${hexID}`)
        .expect(200)
        .then(res => {
          assert.equal(res.body.deleted, true)

          return ArticleLog.findById(articleId)
        })
        .then(doc =>{
          assert.equal(doc, null)
        })

    })//

    it('send invalid _id have status 404', ()=>{

      //send bad fakeID
      //status 404
      //response has property 'deleted' which is false

      const badID = '!000000f7cad342ac046AAAA'

      return request(app)
          .delete(`/article/${badID}`)
          .expect(404)
          .then(res => {
              const data = res.body

              expect(data.deleted).to.be.false
              assert.equal(data.error, 'Bad article id')
          })

    })//

    it('send fake _id have status 404', ()=>{

      //send good fakeID
      //stauts 404
      //response proprety error: Invalid rewuest to delete

      const badID = '1a00aaa111aaaa1111a111a1'

      return request(app)
          .delete(`/article/${badID}`)
          .expect(404)
          .then(res => {

            const data =  res.body

            expect(data.deleted).to.be.false
            assert.equal(data.error, 'Invalid request to delete')

          })

    })

  })//DELETE
    
})//articleLog Route
  
  