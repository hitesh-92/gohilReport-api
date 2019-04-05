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
        // const {_id, createdAt, status } = log
        // const time = Number(createdAt)
        // let data = { _id }
        // let update = false
        // console.log( _id, createdAt, status )
        // console.log(typeof status)

        const { status } = log

        if (status !== 3){
            console.log('####', status)
            const { _id, createdAt } = log

            const nextUpdate = (time, month) => moment(time).add(month, 'months')
            const toIncrease = nextUpdate => moment().isAfter(nextUpdate, 'months')

            const compose = (fnA, fnB) => (d1, d2) => fnB(fnA(d1, d2))
            const processUpdateCheck = compose(nextUpdate, toIncrease)

            if ( status===-1 || status===0 || status===1 ){
                const updateDate = nextUpdate(parseInt(createdAt), 1)
                const increase = moment().isAfter(updateDate, 'months')
                // if (increase) return { _id, status: status++}

                // const increase = processUpdateCheck( parseInt(createdAt) , 1)
                console.log('@@@ ', increase)
                console.log(moment(updateDate).format())
                console.log(moment().format())
            }
            // else if {

            // }


            console.log('end')
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