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

        const { status } = log

        if (status !== 3){

            const { _id, createdAt } = log

            const compose = (fnA, fnB) => (d1, d2) => fnB(fnA(d1, d2))
            const nextUpdate = (time, months) => moment(parseInt(time)).add(months, 'months')
            const toIncrease = nextUpdate => moment().isAfter(nextUpdate)

            const processUpdateCheck = compose(nextUpdate, toIncrease)

            if ( status===-1 || status===0 ){
                const increase = processUpdateCheck(createdAt, 1)
                if (increase) return { _id, status: 1 }
            }
            else if ( status===1 ){
                const increase = processUpdateCheck(createdAt, 2)
                if (increase) return { _id, status: 2 }
            }
            else if ( status===2 ){
                const increase = processUpdateCheck(createdAt, 3)
                if (increase) return { _id, status: 3}
            }
        }
        
        return false
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
        const logs = data.map(log => ({ _id:log.id, createdAt:log.createdAt, status:log.status }))

        // const _time = logs[0].createdAt
        // console.log( moment( Number(_time) ).format('x') ,'x')
        // console.log( moment() )
        const test =  checkStatus(logs[0])

    })
    
    
}


module.exports =  mongoose.model('articleLog', articleLogSchema)