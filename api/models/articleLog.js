const mongoose = require('mongoose')

//Schema for each article log
const articleLogSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true,

    },
    url: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})


module.exports =  mongoose.model('articleLog', articleLogSchema)