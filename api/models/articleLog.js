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
        type: Number
    },
    archived: {
        type: Boolean,
        default: false
    },
    archiveDate: {
        type: String,
        default: null
    }
})

articleLogSchema.statics.updateStatus = function(){
    
    var ArticleLog = this;

    const checkStatus = (log) => {

        const { _id, createdAt, status } = log
        let newStatus; //will be either Number or Boolean

        const compose = (fnA, fnB) => (d1, d2) => fnB(fnA(d1, d2))
        const nextUpdate = (time, months) => moment(parseInt(time)).add(months, 'months')
        const toIncrease = nextUpdate => moment().isAfter(nextUpdate)

        const processUpdateCheck = compose(nextUpdate, toIncrease)

        if ( status===-1 || status===0 ) processUpdateCheck(createdAt, 1) ? newStatus = 1 : newStatus = false
        else if ( status===1 ) processUpdateCheck(createdAt, 3) ? newStatus = 2 : newStatus = false
        else if ( status===2 ) processUpdateCheck(createdAt, 6) ? newStatus = 3 : newStatus = false
        else newStatus = false
        
        if ( newStatus===false ) return false
        return { _id: mongoose.Types.ObjectId(_id), status: newStatus }
    }

    const initUpdate = async (logs) => {
        let reqs = []

        const updateQuery = ({ _id, status }) => {
            return new Promise((resolve) => {
                resolve( ArticleLog.updateOne( {_id}, {$set:{status} } ) )
            })
        }
        
        logs.forEach(log => {
            //checkStatus function outside
            const statusChange = checkStatus(log)
            if ( statusChange !== false ) reqs.push(updateQuery(statusChange))
        })

        await Promise.all(reqs)
    }
    
    return new Promise((resolve, reject) => {
        ArticleLog.find( {'status': {$lt: 3}} )
        .then( data => initUpdate(data) )
        .then( data => resolve(data) )
        .catch(err => reject(err) )
    })
}


module.exports =  mongoose.model('articleLog', articleLogSchema)