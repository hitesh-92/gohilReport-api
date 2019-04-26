const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')

const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

const ObjectId = require('mongoose').Types.ObjectId


router.get('/', (req,res) => {
    const data = {}

    function getAllQuerys(ids, fn){
        let reqs = []
        ids.forEach(id => {
            reqs.push( fn(id) )
        })
        return async function(){
            const [left, center, right] = await Promise.all(reqs)
            return {left,center,right}
        }
    }

    const getColumns = (column) => {
        return new Promise((resolve) => {
            const query = Column.where({title: column})
            resolve( query.findOne() )
        })
    }

    const getArticles = (ids) => {
        let queryArr = []
        ids.forEach(id => queryArr.push({_id: id}))

        return new Promise((resolve) => {
            resolve( ArticleLog.find({_id: {$in:queryArr} }) )
        })
    }

    const getIDsArray = (columns) => {
        return [
            columns.left.articleIDs,
            columns.center.articleIDs,
            columns.right.articleIDs
        ]
    }

    const columns = ['left','center','right']

    const queryColumns = getAllQuerys(columns, getColumns)

    queryColumns().then(columns => {
        data.columns = columns
        const queryArticles = getAllQuerys(getIDsArray(columns), getArticles)
        return queryArticles()
    })
    .then(articles => {
        data.leftArticles = articles.left
        data.centerArticles = articles.center
        data.rightArticles = articles.right

        res.status(200).send(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).send(data)
    })
});


router.get('/:column', (req, res) => {

    let title = req.params.column

    let data = {
        time: new Date().getTime(),
        requestedColumn: title,
        columnData: {},
    }

    Column.findOne({title})
    .then(singleColumn => {

        data.columnData = singleColumn

        //return if no column found
        if(singleColumn == null) return

        //array of ids to find
        const ids = singleColumn.articleIDs.map(id => ({_id: id}))
        return ArticleLog.find({_id: {$in: ids} })
    })
    .then(articles => {
        let status = 200;
        data.error = false

        if(articles) data.articles = articles

        if(data.columnData == null){
            data.message = 'Column not found'
            data.error = true 
            status = 400
        }

        res.status(status).json(data)
    })
    .catch(e => {
        data.error = { status:true, message:e }
        data.message = 'Error processing request'
        res.status(500).json(data)
    })

})


router.post('/', Authenticate, (req, res) => {

    let data = {
        title: req.body.title,
        articleIDs: req.body.articleIDs,
        error: {},
        createdColumn: {},
        time: new Date().getTime(),
        saved: false
    }

    const invalidID = data.articleIDs.map(id => ObjectId.isValid(id)).filter(val => val===false).length > 0
    const invalidTitle = data.title === undefined || data.title.length < 1

    if ( invalidID || invalidTitle ){
        if ( invalidID ) data.error.articleIDs = 'Invalid Article ID(s) provided'
        if ( invalidTitle ) data.error.title = 'Invalid Column Title'
        return res.status(400).send(data)
    }

    const column = new Column({
        _id: new ObjectId(),
        lastUpdated: new Date().getTime(),
        title: data.title,
        articleIDs: data.articleIDs
    })

    column.save()
    .then(savedColumn => {

        let status = 200
        data.createdColumn = savedColumn
        data.message = 'success'

        if (!savedColumn){
            stats = 400
            data.message = 'Please check error to see further details'
        }
        else data.saved = true

        res.status(status).json(data)
    })
})


router.patch('/:column', Authenticate, (req,res) => {

    let data = {}

    const columnTitle = req.params.column
    const newArticleIDs = req.body.ids
    
    function updateColumn(column, idsArray){

        const id = column._id
        const body = {
            title: column.title,
            lastUpdated: new Date().getTime(),
            articleIDs: idsArray
        }

        return async () => Column.updateOne( {_id:id}, {$set:body} )
    }

    const validateIDs = (arr) => {
        
        const badID = arr.filter(id => ObjectId.isValid(id)===false)

        if ( badID.length===0 ) return true
        else {
            data.error = { invalidIDs : badID }
            return false
        }
    }

    //check for any invalid IDs
    const ids_valid = validateIDs(newArticleIDs)

    if( ids_valid===false ){
        data.error = { message: 'Invalid article ID provided. Check entry' }
        return res.status(400).send(data)
    }

    Column.find({title: columnTitle})
    .then(column => {

        if(column.length === 0){
            data.error = { message: 'Invalid Column Requested' }
            return null
        }

        //create new IDs array to save in column document
        const newIDsArray = [...column[0].articleIDs, ...newArticleIDs]

        data.column = column
        data.newArticleIDs = newIDsArray

        return updateColumn(column[0], newIDsArray)()
    })
    .then(response => {
        let status = 200
        
        response===null ? status = 404 : data.message = 'success'
        res.status(status).send(data)
    })
})


router.delete('/:column', Authenticate, (req,res) => {

    const columnSelected = req.params.column

    let data = {
        deleteRequest: columnSelected,
        deleted: true,
        message: 'success'
    }

    Column.findOneAndDelete({title: columnSelected})
    .then(log => {

        let status = 200
        
        if(log === null){
            status = 400
            data.message = 'Invalid Column Provided'
            data.deleted = false
        }
            
        res.status(status).send(data)
    })

})

module.exports = router;