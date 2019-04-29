const {app} = require('../../../app')

const {  
  articles, 
  users
} = require('../../seedData')
const ArticleLog = require('../../../api/models/articleLog')
const Column = require('../../../api/models/column')

const request = require('supertest')
const assert = require('assert')

describe("article/ Routes", ()=>{

  const userData = {
    email: users[0].email,
    password: users[0].password
  }

  describe("GET /:articleId", ()=>{

    it('retrieve saved ArticleLog using _id', ()=>{

      const article = articles[0]
      const id = article._id.toHexString()
      const uri = `/article/${id}`

      return request(app)
      .get(uri)
      .expect(200)
      .then(response => {
        const res = response.body

        assert.equal(res.found, true)
        assert.equal(res.article.title, article.title)
      })
    })//

    it('Bad ID results in not found', ()=>{

      const badID = '123456'

      return request(app)
      .get(`/article/${badID}`)
      .expect(400)
      .then(response => {
        const res = response.body

        assert.equal(res.found, null)
        assert.equal(res.requestId, badID)
      })
    })//

  })//GET /:articleLogID
  
  describe("POST /", ()=>{

    it('create and save new article', ()=>{

      const articleData = {
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
  
      const articleData = {
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
        assert.equal(res.articleSaved, false)
      })
    })//
  
    it('save new Article, find in db using response _id', ()=>{

      const articleData = {
        title: 'return 2019',
        url: 'www.2019.com'
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
        const articleId = response.body.createdArticle._id

        ArticleLog.findById(articleId)
        .then(log => {
          assert.equal(log.title, articleData.title)
          assert.equal(log.url, articleData.url)
        })
      });
    })//

  })//POST

  describe("PATCH /:articleId", ()=>{

    it('updates article title/url', ()=>{

      const oldArticle = articles[0]
      const hex_id = oldArticle._id.toHexString()

      const newData = {
        title: 'one uno eno noe',
        url: 'http://wwww.oneoneone.com'
      }

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
        return request(app)
        .patch(`/article/${hex_id}`)
        .set('x-auth', response.header['x-auth'])
        .send(newData)
        .expect(200)
      })
      .then(response => {
        const res = response.body

        assert.equal(res.status, true)
      })
    })

  })

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
        const res = response.body
        assert.equal(res.deleted, true)
        assert.equal(res.log._id, articleId)
      })

    })//

    it('reject invaid id with 404', () => {

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
        const res = response.body
        assert.equal(res.deleted, false)
        assert.equal(res.error, 'Bad article id')
      })

    })//

    it('not find article that does not exist', () => {

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

  describe.only('/archive/ Routes', () => {

    it('archive existing article', () => {
      //add new prop to ArticleLog called archived
      //filter out from columns articleIDs and remove
      //add to Column: archive
      //TEST: column:title 'archive' for id

      const archiveID = articles[3]._id

      return request(app)
      .post('/user/login')
      .send(userData)
      .then(response => {
          return request(app)
          .post('/article/archive')
          .set('x-auth', response.header['x-auth'])
          .send({ id: archiveID })
          .expect(200)
          .then( ({body: {archived}}) => {
            assert.equal(archived, true)
            return ArticleLog.findById(archiveID)
          })
          .then( ({archived}) => {
            assert.equal(archived, true)
            return Column.findOne({title: 'archive'})
          })
          .then(column => {
            assert.equal(column.articleIDs.length, 1)
          })
      })

    })//

  })//archive Routes

})//articleLog Route
  
  