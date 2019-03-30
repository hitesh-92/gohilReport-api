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
    // -1: alert 1month  red--text
    //  0: new           amber
    //  1: 1 month       amber-green
    //  2: 3 months      green
    //  3: 6 months      white
    //
    //  ADD LATER
    //  null: archived

    it("static updateLogs method updates articles", () => {
        // optimise. testTime > 2s. db requests?

        const userData = {
            email: users[0].email,
            password: users[0].password
        }

        //update 5 articles, 1 for each status
        //get /column/ where add .finally block to update all articleLog status
        //find init article and test if status is 1

        let _articles = articles
        _articles.pop()

        const editDate = (time, status) => {
            let updateTo;

            const update = months => moment(time).subtract(months,'months').subtract(1, 'days').format('x')

            if ( status===-1||status===1) updateTo = update(1)
            else if ( status===2 ) updateTo = update(3)
            else if ( status===3 ) updateTo = update(6)
            else updateTo = moment().format('x')
            return updateTo
        }

        function initUpdate(articles){
            let reqs = []

            const setupReq = (id,body) => {
                return new Promise((resolve) => {
                    resolve(ArticleLog.updateOne({_id:id}, {$set:body}))
                })
            }

            articles.forEach(article => {
                const id = article._id
                const body = { createdAt: article.createdAt }
                reqs.push(setupReq(id,body))    
            })

            return async() => Promise.all(reqs)
        }

        function initFetch(ids){
            let reqs = []

            const setupReq = id => {
                return new Promise(resolve => {
                    resolve(ArticleLog.where( {_id:id} ))
                })
            }

            ids.forEach(id => reqs.push(setupReq(id)))

            return async() => Promise.all(reqs)
        }
        
        //change article dates
        const status = [-1, 0, 1, 2, 3]
        _articles = _articles.map(log => [{_id:log._id, createdAt:log.createdAt }])
        for(i in _articles) _articles[i][0].createdAt = editDate(_articles[i].createdAt, status[i])
        //put objects into single array
        const updateData = _articles.map(a => a[0])
        const ids = updateData.map(log => log._id)

        //manually update articleLogs
        //call ArticleLog.updateStatus
        //fetch all updated articleLogs
        //test if status are updated
        const updateArticles = initUpdate(updateData)
        return updateArticles()
        .then(() => ArticleLog.updateStatus())
        .then(() => {
            const ids = updateData.map(log => log._id)
            const fetchArticles = initFetch(ids)
            return fetchArticles()
        })
        .then(res => {
            const data = res.map(log => log[0])
            // console.log(data[0])
            
            assert.equal(data[0].status, 1)
            assert.equal(data[1].status, 1)
            assert.equal(data[2].status, 2)
            assert.equal(data[3].status, 3)
            assert.equal(data[4].status, 3)

            assert.equal(data[0].createdAt, updateData[0].createdAt)
            
        })
    })

});