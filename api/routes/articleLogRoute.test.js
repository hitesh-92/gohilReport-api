const {app} = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect, should } = require('chai')
const mongoose = require('../../db/mongoose')
const request =  require('supertest')
const assert = require('assert')

// const ENV = require('dotenv')
// ENV.config()

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

          console.log(
            `port:${process.env.PORT} | ` +
            `db_uri: ${process.env.MONGODB_URI}`
        );
  })

})

