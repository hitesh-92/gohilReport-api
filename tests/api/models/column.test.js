const Column = require('../../../api/models/column')
const mongoose = require('mongoose')
const assert = require('assert')
const { Types: {ObjectId} } = mongoose

describe('MODEL column', () => {

    it('create new column', async () => {
        
        const column = new Column({
            _id: new mongoose.Types.ObjectId(),            
            title: 'testColumn'
        })

        const {
            _id,
            title,
            createdAt
        } = await column.save()

        assert.equal(ObjectId.isValid(_id), true)
        assert.equal(title, 'testColumn')
        assert.equal(typeof createdAt, 'object')
    })//

});


