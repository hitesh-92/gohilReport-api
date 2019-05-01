const mongoose = require('mongoose')

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
}, {
    timestamps: true
})

module.exports = mongoose.model('column', columnSchema)