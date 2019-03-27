const mongoose = require('mongoose')

// Schema for columns
// need 3 columns in total
// needs name of column
// needs a last updated value
// needs to hold articles in order
// article IDs to be held in array

const columnSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    },
    lastUpdated: {
        type: String,
        required: true
    },
    articleIDs: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model('column', columnSchema)