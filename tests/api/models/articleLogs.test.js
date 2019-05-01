const moment = require('moment')
const mongoose = require('mongoose')

const ArticleLog = require('../../../api/models/articleLog')
const { articles } = require('../../seedData')

const assert = require('assert')


describe("MODEL articleLog", ()=>{

    it('create new log with 4 properties', async ()=>{

        const body = {
            _id: new mongoose.Types.ObjectId(),
            title: 'createLog',
            url: 'www.has4props.com'
        }

        const article =  new ArticleLog(body);

        const {
            _id,
            title,
            url,
            archived,
            createdAt,
            updatedAt
        } = await article.save()

        assert.equal(title, body.title)
        assert.equal(typeof _id, 'object')
        assert.equal(typeof createdAt, 'object')
        assert.equal(typeof updatedAt, 'object')
        assert.equal(archived, false)
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
    //  -1 = manual edit to 0
    //  0 ++ = 1 month
    //  1 ++ = 3months
    //  2 ++ = 6months
    //  3 nil
    // 
    //  ADD LATER
    //  10: archived


    it('updateLogs method updates articles status', () => {
        
        const buildUpdateData = () => {

            const status = [0, 1, 2, 3]
            const monthIncrement = [1 , 3, 6, 0]
            const data = [
                { title: 'firstPost', url:'www.oneee.com' },
                { title: 'secondPost', url:'www.twoo.com' },
                { title: 'thirdPost', url:'www.treee.com' },
                { title: 'fourthPost', url:'www.fourrr.com' }
            ]

            const createArticle = ( {title, url}, status, months ) => {

                const time = moment().subtract(months, 'months').subtract(1, 'days')
                return new ArticleLog({
                    _id: mongoose.Types.ObjectId(),
                    title,
                    url,
                    status,
                    createdAt: time
                })
            }

            return data.map( (log, i) => createArticle(log, status[i], monthIncrement[i]) )
        }

        const saveArticles = async (logs) => {
            for(log of logs) await log.save()
        }

        const articleData = buildUpdateData()
        const articleIDs = articleData.map(log => log._id)

        return saveArticles(articleData)
        .then(() => ArticleLog.updateStatus())
        .then( async () => {
            const data = await ArticleLog
            .find( {'_id': {$in: articleIDs}} )
            .select('status')
            .exec()

            assert.equal(data[0].status, 1)
            assert.equal(data[1].status, 2)
            assert.equal(data[2].status, 3)
            assert.equal(data[3].status, 3)
        })
    })

});