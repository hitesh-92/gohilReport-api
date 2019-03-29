const {app} =  require('../../../app')

const ArticleLog = require('../../../api/models/articleLog')

const mongoose = require('mongoose')

const request = require('supertest')
const assert = require('assert')


describe("MODEL articleLog", ()=>{

    it('create new log with 4 properties', ()=>{

        const title = 'createLog'
        const url = 'www.has4props.com'

        const article =  new ArticleLog({
            _id: new mongoose.Types.ObjectId(),
            title,
            url
        });

        // console.log(article)

        //check key:value pairs where possible
        //test data types
        assert.equal(article.title, title)
        assert.equal(article.url, url)
        assert.equal(article.createdAt.length, 13)
        assert.equal(typeof article.title, 'string')
        assert.equal(typeof article.url, 'string')
        assert.equal(typeof article.createdAt, 'string')
        assert.equal(typeof article._id, 'object')

    })//

    
    //could have an increment count to hold value

    //for alert column 
    //add an option to not set this counter
    //add a way to switch it on at a later date = new articleLog method


    // articleLog status prop:
    // -1: alert
    //  0: new
    //  1: 1 month old
    //  2: 3 months old
    //  3: old
    //  null: archived

    it("static updateLogs method updates articles", () => {



    })

});