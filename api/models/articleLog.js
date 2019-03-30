const mongoose = require('mongoose')
const moment = require('moment')

//Schema for each article log
const articleLogSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: {
        type: String,
        required: true,

    },
    url: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: String,
        default: new Date().getTime()
    },
    status: {
        type: Number,
        default: 0
    }
})

articleLogSchema.statics.updateStatus = function(){
    
    var ArticleLog = this;

    function update(logs){
        let q = []

        logs.forEach(log => {

        })
    }

    return ArticleLog.find({})
    .then(response => {
        const logs = response.map(log => {
            return { _id:log.id, createdAt:log.createdAt, status:log.status }
        })

        // const updated = logs.map(log => update(log))

        update(logs)

        // console.log(logs)
    })

    // ArticleLog.update({})
    

}


module.exports =  mongoose.model('articleLog', articleLogSchema)