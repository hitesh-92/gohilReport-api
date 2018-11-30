const Column = require('../../../api/models/column')
const mongoose = require('mongoose')
const {ObjectId} = require('mongodb')
const assert = require('assert')


describe('MODEL column', ()=>{

    it('create new column', ()=>{

        const testCol = new Column({
            _id: new ObjectId(),
            name: 'testColumn',
            lastUpdated: new Date().getTime(),
            articles:{
                type: Object
            }
        })

        // check data types
        assert.equal(typeof testCol._id, 'object')
        assert.equal(typeof testCol.name, 'string')
        assert.equal(typeof testCol.lastUpdated, 'string')
        assert.equal(typeof testCol.articles, 'object')

        // assert.equal()

    })//

});


// const testID = new ObjectId()
// const check = ObjectId.isValid(testID)
// console.log(check)
