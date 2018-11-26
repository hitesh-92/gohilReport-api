const app = require('../../app')
const ArticleLog = require('../models/articleLog')
const { expect, should } = require('chai')
const mongoose = require('mongoose')


describe('POST /article', ()=>{
    it('create a new article', ()=> {


        ArticleLog.findById(id).then(data => {
            expect(data.title).to.equal('testTitle')
        })
    })
})