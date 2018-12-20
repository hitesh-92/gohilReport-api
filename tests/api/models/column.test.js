const Column = require('../../../api/models/column')
const mongoose = require('mongoose')
const assert = require('assert')
const {articles} = require('../../seedData')

describe('MODEL column', ()=>{

    it('create new column', ()=>{
        const data = [
            articles[0]._id,
            articles[1]._id
        ]

        const testCol = new Column({

            _id: new mongoose.Types.ObjectId(),            
            title: 'testColumn',
            lastUpdated: new Date().getTime(),
            articleIDs: data
        })

        // check data types
        assert.equal(typeof testCol._id, 'object')
        assert.equal(typeof testCol.title, 'string')
        assert.equal(typeof testCol.lastUpdated, 'string')
        assert.equal(typeof testCol.articleIDs, 'object')

        assert.equal(testCol.articleIDs[0], data[0])
        assert.equal(testCol.articleIDs[1], data[1])

    })//

    //test after adding article IDs
    
    console.log(00000)

});


