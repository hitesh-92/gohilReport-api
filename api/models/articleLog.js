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

    const checkStatus = (log) => {
        const {_id, createdAt } = log
        let { status } = log
        const time = Number(createdAt)
        let data = { _id }

        switch (status) {
            case 0:
                // 1 month ahead
                break;
        
            default:
                break;
        }
    }

    const initUpdate = (logs) => {
        let reqs = []

        
        logs.forEach(log => {
            const statusChange = checkStatus(log)
        })

        return async () => Promise.all(reqs)
    }

    return ArticleLog.find({})
    .then(data => {
        const logs = data.map(log => {
            return { _id:log.id, createdAt:log.createdAt, status:log.status }
        })

        // const _time = logs[0].createdAt
        // console.log( moment( Number(_time) ).format('x') ,'x')

        const test =  checkStatus(logs[0])
    })
}


module.exports =  mongoose.model('articleLog', articleLogSchema)