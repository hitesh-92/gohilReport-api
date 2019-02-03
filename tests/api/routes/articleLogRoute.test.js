const {app} =  require('../../../app')

const {  
  articles, 
  users
} = require('../../seedData')
const ArticleLog = require('../../../api/models/articleLog')

const request = require('supertest')
const {expect} = require('chai')
const assert = require('assert')

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

    it('create and save new article', ()=>{

      let userData = {
        email: users[0].email,
        password: users[0].password
      }

      let articleData = {
        title: 'return201',
        url: 'www.201.com'
      }

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .post('/article/')
        .set('x-auth', response.header['x-auth'])
        .send(articleData)
        .expect(201)
      })
      .then(response => {
        assert.equal(response.body.articleSaved, true)
      })

    })//
  
    it('send bad data; status 400 and articleSaved to be false', () => {
      
      let userData = {
        email: users[0].email,
        password: users[0].password
      }
      
      let articleData = {
        title: false,
        url: undefined
      }

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .post('/article/')
        .set('x-auth', response.header['x-auth'])
        .send(articleData)
        .expect(400)
      })
      .then(response => {
        const res = response.body

        assert.equal(res.createdArticle, null)
        assert.equal(res.articleSaved, false)
      })
    })//
  
    it('save new Article, find in db using response _id', ()=>{

      let userData = {
        email: users[0].email,
        password: users[0].password
      }

      let articleData = {
        title: 'return 2019',
        url: 'www.2019.com'
      }

      let articleId;

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .post('/article/')
        .set('x-auth', response.header['x-auth'])
        .send(articleData)
        .expect(201)
      })
      .then(response => {
        articleId = response.body.createdArticle._id

        ArticleLog.findById(articleId)
        .then(log => {
          assert.equal(log.title, articleData.title)
          assert.equal(log.url, articleData.url)
        })
      });
    })//

  })//POST

  describe("DELETE /:articleId", ()=>{

    it('should delete exisitng article', () => {

      const articleId = articles[1]._id
      const hexID = articleId.toHexString()

      let userData = {
        email: users[0].email,
        password: users[0].password
      }

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .delete(`/article/${hexID}`)
        .set('x-auth', response.header['x-auth'])
        .expect(200)
      })
      .then(response => {
        assert.equal(response.body.deleted, true)
      })

    })//

    it('send invalid _id have status 404', () => {

      const badID = '!000000f7cad342ac046AAAA'

      let userData = {
        email: users[0].email,
        password: users[0].password
      }

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .delete(`/article/${badID}`)
        .set('x-auth', response.header['x-auth'])
        .expect(404)
      })
      .then(response => {
        assert.equal(response.body.deleted, false)
        assert.equal(response.body.error, 'Bad article id')
      })

    })//

    it('send fake _id have status 404', () => {

      const badID = '1a00aaa111aaaa1111a111a1'

      let userData = {
        email: users[0].email,
        password: users[0].password
      }

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .delete(`/article/${badID}`)
        .set('x-auth', response.header['x-auth'])
        .expect(404)
      })
      .then(response => {
        assert.equal(response.body.deleted, false)
        assert.equal(response.body.error, 'Invalid request to delete')
      })

    })

  })//DELETE
    
})//articleLog Route
  
  