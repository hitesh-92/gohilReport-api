const moment = require('moment')
const mongoose = require('mongoose')

const ArticleLog = require('../../../api/models/articleLog')
const { articles } = require('../../seedData')

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

    

    //.updateStatus info

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
    //  #re-write
    //  -1,0 ++ = 1 month
    //  1 ++ = 3months
    //  2 ++ = 6months
    //  3 nil
    // 
    //  ADD LATER
    //  null: archived


    it('updateLogs method updates articles status', () => {
        // testTime > 1s
        
        const buildUpdateData = () => {
            //return array of articles with status&&createdAt modified
            const status = [-1, 0, 1, 2, 3]

            let _articles = articles
            _articles.pop()

            const editArticle = ({_id}, newStatus) => {

                let updatedLog = {
                    _id,
                    status: newStatus
                }

                const update = months => moment().subtract(months,'months').subtract(1, 'hours').format('x')

                if ( newStatus===-1 || newStatus===0 ) updatedLog.createdAt = update(1)
                else if ( newStatus===1 ) updatedLog.createdAt = update(3)
                else if ( newStatus===2 ) updatedLog.createdAt = update(6)
                else if ( newStatus===3 ) updatedLog.createdAt = update(7)

                return updatedLog
            }
            return _articles.map( (log, index) => editArticle(log, status[index]) )
        }

        const initArticleUpdate = async (logs) => {
             const requests = logs.map( ({
                _id, status, createdAt
            }) => {
                return new Promise((resolve) => {
                    resolve(ArticleLog.updateOne( 
                        { _id },
                        {$set: {createdAt, status} }
                    ))
                })
            })
            return await Promise.all(requests)
        }

        const articleData = buildUpdateData()
        const articleIDs = articleData.map(log => mongoose.Types.ObjectId(log._id))

        return initArticleUpdate(articleData)
        .then(() => ArticleLog.updateStatus())
        .then(() => ArticleLog.find( {'_id': {$in: articleIDs}} ) )
        .then(data => {
            assert.equal(data[0].status, 1)
            assert.equal(data[1].status, 1)
            assert.equal(data[2].status, 2)
            assert.equal(data[3].status, 3)
            assert.equal(data[4].status, 3)
        })
    })

});