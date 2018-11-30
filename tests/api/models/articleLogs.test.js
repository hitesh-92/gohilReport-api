const ArticleLog = require('../../../api/models/articleLog')
// const {expect} = require('chai')
const mongoose = require('mongoose')
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

    //add property to hold value of color
    //color will change over time
    //every couple weeks the change color should change a shade
    //start red then change over time to eventually be black
    //set up so that createdAt is used as base as to when change takes place
    //find function to do this
    //find best place to implement this
    //
    //could have an increment count to hold value

    //for alert column 
    //add an option to not set this counter
    //add a way to switch it on at a later date

});