const mongoose = require('mongoose')

//Schema for each article log
const articleLogSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: {
        type: String,
        required: true,

    },
    url: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: new Date().getTime()
    }
})


module.exports =  mongoose.model('articleLog', articleLogSchema)