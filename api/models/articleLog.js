const mongoose = require('mongoose')
const moment = require('moment')

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
},  {
    timestamps: true
})

articleLogSchema.statics.updateStatus = function(){
    
    var ArticleLog = this;

    const checkStatus = ({_id, status, createdAt}) => {

        let newStatus; //will be either Number or Boolean

        const compose = (fnA, fnB) => (d1, d2) => fnB(fnA(d1, d2))
        const nextUpdate = (time, months) => moment(time).add(months, 'months')
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

        const updateQuery = ({ _id, status }) => {
            return new Promise((resolve) => {
                resolve( 
                    ArticleLog
                    .updateOne( {_id}, {$set:{status} } )
                )
            })
        }
        
        const requests = logs.map(log => {
            const statusChange = checkStatus(log)
            if ( statusChange !== false ) return updateQuery(statusChange)
        })

        return await Promise.all(requests)
    }
    
    return new Promise((resolve, reject) => {
        ArticleLog.find( {'status': {$lt: 3}} )
        .select('_id status createdAt')
        .exec()
        .then( async (toUpdate) => {
            const updated = await initUpdate(toUpdate)
            resolve({toUpdate, updated})
        })
        .catch(error => reject(error))
    })
}

module.exports =  mongoose.model('articleLog', articleLogSchema)