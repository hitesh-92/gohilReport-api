const mongoose = {
    Schema,
    Types: { ObjectId }
} = require('mongoose');

const columnSchema = Schema({
    _id: ObjectId,
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('column', columnSchema)