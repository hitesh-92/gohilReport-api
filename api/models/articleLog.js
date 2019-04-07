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
    //optimise db collection query to only find articles with status<3 
    
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
                // console.log('A')
                const increase = processUpdateCheck(createdAt, 1)
                if (increase) return { _id, status: 1 }
            }
            else if ( status===1 ){
                // console.log('B')
                const increase = processUpdateCheck(createdAt, 2)
                if (increase) return { _id, status: 2 }
            }
            else if ( status===2 ){
                // console.log('C')
                const increase = processUpdateCheck(createdAt, 3)
                if (increase) return { _id, status: 3}
            }
        }
        
        return false
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

    return ArticleLog.find({})
    .then(data => {
        const logs = data.map(log => ({ _id:log.id, createdAt:log.createdAt, status:log.status }))

        //update status in testcase!!

        return initUpdate(logs)()

        

    })
    .then(d => {
        console.log('update END')
    })
    
    
}


module.exports =  mongoose.model('articleLog', articleLogSchema)