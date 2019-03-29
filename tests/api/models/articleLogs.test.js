const moment = require('moment')

const {app} =  require('../../../app')

const mongoose = require('mongoose')

const ArticleLog = require('../../../api/models/articleLog')
const { users, articles } = require('../../seedData')

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
    // -1: alert    red--text
    //  0: new      amber
    //  1: 1 month  amber-green
    //  2: 3 months green
    //  3: 6 months white
    //
    //  ADD LATER
    //  null: archived

    it.only("static updateLogs method updates articles", () => {

        //update 5 articles, 1 for each status
        //get /column/ where add .finally block to update all articleLog status
        //find init article and test if status is 1

        let _articles = articles
        _articles.pop()
        const toUpdate = _articles.map(log => [{ _id:log._id, createdAt:log.createdAt }])
        const status = [-1, 0, 1, 2, 3]

        const editDate = (time, status) => {
            //switch statement for status
            // let updateTo;

            console.log(moment(time))


            // switch (status) {
            //     case -1:
            //         updateTo = new Date()
            //         break;
            
            //     default:
            //         break;
            // }

            // const currentTime = new Date().getTime()
            // // console.log(time, status)
            return status
        }


        //edit dates
        // for(i in toUpdate) toUpdate[i].createdAt = editDate(toUpdate[i].createdAt, status[i])
        
        // editDate(toUpdate[0].createdAt, status[0])

        const date = toUpdate[0].createdAt

        console.log( moment(date).format() )
        console.log( moment(date).add(1, 'months').format() )

        // for (i in toUpdate) console.log(toUpdate[i])

        // console.log(toUpdate)

    })

});