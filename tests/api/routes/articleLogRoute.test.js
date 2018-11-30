const {app} =  require('../../../app')
const ArticleLog = require('../../../api/models/articleLog')
const request = require('supertest')
const {expect} = require('chai')
const assert = require('assert')

const {articles, seedArticles} = require('../../seedData')

beforeEach(seedArticles)

describe("articleLog Routes", ()=>{

    describe("GET /article/", ()=>{
  
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
          .catch(e => {
            throw new Error(e)
          })
  
      })//
    
    })// GET
  
    describe("GET /article/:articleLogID", ()=>{
  
      it('retrieve saved ArticleLog using _id', ()=>{
  
        id = articles[0]._id
  
        return request(app)
          .get(`/article/${id}`)
          .then(res => {
            //returns data object, pickout log
            const log = res.body.data

            assert.equal(log.title, articles[0].title)
            assert.equal(log.url, articles[0].url)
            assert.equal(log.createdAt, articles[0].createdAt)

            //if successful found will be true 
            assert.equal(res.body.found, true)

          })
          .catch(e => {
            throw new Error(e)
          })

      })//
  
      it('send bad ID get back 404status and found:false', ()=>{

        //send fake id
        const badID = '0000005d65cb4d1840ae8306'
  
        return request(app)
          .get(`/article/${badID}`)
          .then(response => {
            const res = response.body

            //found propery should be false
            expect(res.found).to.be.false

            //returns the id used when making request
            expect(res._id).to.equal(badID)

          })
          .catch(e => {
            throw new Error(e)
          })
      })//
  
    })//GET /:articleLogID
    
    describe("POST /article/", ()=>{
  
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
          .catch(e => console.log(e))
  
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
          .catch(e => console.log(e))
  
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
  
          }).catch((e) => console.log(e))
  
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
              .catch(e => console.log(e))
  
          })
          .catch(e =>  console.log(e))
  
      })//
  
    })//POST
  
    describe("DELETE /article/:articleLogID", ()=>{
  
      it('should delete and exisitng article', ()=>{

        //response has property 'deleted' which is true
  
        const articleId = articles[1]._id
        const hexID = articleId.toHexString()
  
        return request(app)
          .delete(`/article/${hexID}`)
          .expect(200)
          .then(res => {
              // expect(res.body.deleted).to.be.true
              assert.equal(res.body.deleted, true)
          })
          .catch(e => {
              throw new Error(e)
          })
  
      })//

      it('send bad fake _id have status 404', ()=>{

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
            .catch(e => {
                throw new Error(e)
            })

      })//

      it('send good fake _id have status 404', ()=>{

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
            .catch(e => {
              throw new Error(e)
            })

      })

    })//DELETE
    
})//articleLog Route
  
  