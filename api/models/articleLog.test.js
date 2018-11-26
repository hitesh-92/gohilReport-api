const articleLog = require('./articleLog')
const { expect, should } = require('chai')
const mongoose = require('mongoose')

describe('articleLog', ()=>{

    it('has 4 properties and correct data types', ()=>{
        let article = new articleLog({
            _id: new mongoose.Types.ObjectId(),
            title: 'testTitle',
            url: 'www.testsite.com'
        });

        expect(typeof article.title).to.equal('string')
        expect(typeof article.url).to.equal('string')
        expect(typeof article.createdAt).to.equal('string')
        expect(article.createdAt).to.have.lengthOf(13)
        expect(typeof article._id).to.equal('object')
    })

})