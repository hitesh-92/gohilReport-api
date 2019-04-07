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
    //  -1,0 ++ = 1 month
    //  1 ++ = 3months
    //  2 ++ = 6months
    //  3 nil
    // 
    //  ADD LATER
    //  null: archived



    it.only('updateLogs method updates articles status', () => {

        const buildUpdateData = () => {
            //return array of articles with status&&createdAt modified
            const status = [-1, 0, 1, 2, 3]

            let _articles = articles
            _articles.pop()

            const editArticle = (log, newStatus) => {

                let updatedLog = {
                    _id: log._id,
                    status: newStatus
                }

                const update = months => moment().subtract(months,'months').subtract(1, 'hours').format('x')

                if ( newStatus===-1 || newStatus===0 ) updatedLog.createdAt = update(1)
                else if ( newStatus===1 ) updatedLog.createdAt = update(3)
                else if ( newStatus===2 ) updatedLog.createdAt = update(6)
                else updatedLog.createdAt = update(0)

                return updatedLog
            }
            return _articles.map( (log, index) => editArticle(log, status[index]) )
        }

        const initArticleUpdate = logs => {
            requests = logs.map(log => {
                return new Promise((resolve) => {
                    resolve(ArticleLog.updateOne( 
                        {_id: log._id},
                        {$set: 
                            { createdAt: log.createdAt, status: log.status }
                        }
                    ))
                })
            })
            return async() => Promise.all(requests)
        }

        const articleData = buildUpdateData()
        const articleIDsQuery = articleData.map(log => mongoose.Types.ObjectId(log._id))

        const updateArticles = initArticleUpdate(articleData)
        return updateArticles()
        .then(() => ArticleLog.updateStatus())
        .then(() => ArticleLog.find( {'_id': {$in: articleIDsQuery}} ) )
        .then(data => {
            // assert.equal(data[0].status, 1)
            // assert.equal(data[1].status, 1)
            // assert.equal(data[2].status, 2)
            // assert.equal(data[3].status, 3)
            // assert.equal(data[4].status, 3)
            assert.equal(data[0].createdAt, articleData[0].createdAt)
        })
    })


});