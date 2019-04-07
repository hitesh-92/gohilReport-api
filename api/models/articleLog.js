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

        const { _id, createdAt, status } = log
        let newStatus;

        const compose = (fnA, fnB) => (d1, d2) => fnB(fnA(d1, d2))
        const nextUpdate = (time, months) => moment(parseInt(time)).add(months, 'months')
        const toIncrease = nextUpdate => moment().isAfter(nextUpdate)

        const processUpdateCheck = compose(nextUpdate, toIncrease)


        switch (status) {
            case -1 || 1:
                processUpdateCheck(createdAt, 1) === true ? newStatus = 1 : newStatus = null
                break;
            
            case 1:
                processUpdateCheck(createdAt, 2) === true ? newStatus = 1 : newStatus = null
                break;
            
            case 2:
                processUpdateCheck(createdAt, 3) === true ? newStatus = 1 : newStatus = null
                break;
        
            default:
                break;
        }

        newStatus === null ? false : { _id, status: newStatus }
    }

    const initUpdate = (logs) => {
        let reqs = []

        const updateQuery = log => {
            return new Promise((resolve) => {
                resolve( ArticleLog.updateOne( {id: log._id}, {$set:{status:log.status}} ) )
            })
        }
        
        logs.forEach(log => {
            const statusChange = checkStatus(log)
            // console.log(statusChange)
            if ( statusChange !== false ) reqs.push(updateQuery(statusChange))
        })

        return async () => Promise.all(reqs)
    }

    // return ArticleLog.find({})
    // .then(data => {
    //     const logs = data.map(log => ({ _id:log.id, createdAt:log.createdAt, status:log.status }))

    //     //update status in testcase!!

    //     return initUpdate(logs)()

        

    // })
    // .then(d => {
    //     console.log('update END')
    // })
    
    return ArticleLog.find( {'status': {$lt: 3}} )
    .then(data => {
        console.log(data)
    })
    
}


module.exports =  mongoose.model('articleLog', articleLogSchema)