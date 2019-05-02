const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Authenticate = require('../middleware/auth')

const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

const { Types: {ObjectId}} = mongoose

router.get('/', (req, res) => {
    
    const data = {}

    const fetchColumns = async () => await Column
    .find({
        'title': {$in: [ 'left', 'center', 'right' ]}
    })
    .select('_id title')
    .exec()

    const articleQuery = async (column) => {
        return new Promise((resolve) => {
            resolve(
                ArticleLog.find({
                    'column': {$in: column}
                })
                .select('_id title url status column')
                .exec()
            )
        })
    }

    const fetchAllArticles = async (columns) => {
        const requests = columns.map( ({_id}) => articleQuery(_id) )
        return await Promise.all(requests)
    }
    
    
    fetchColumns()
    .then(columns => fetchAllArticles(columns))
    .then( ([
        center,
        left,
        right
    ]) => {
        data.center = center
        data.left = left
        data.right = right

        res.status(200).json(data)
    })
});


router.get('/:column', (req, res) => {

    const title = req.params.column

    let data = {}

    Column.findOne({title})
    .exec()
    .then(column => {
        
        data.columnData = column
        
        if(column == null) return

        return ArticleLog.find({
            'column': {$in: column._id} 
        })
        .exec()
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
        error: {},
        createdColumn: {},
        saved: false
    }

    if( data.title.trim().length < 4 ) {
        data.error = 'Invalid title'
        return res.status(400).send(data)
    }

    const column = new Column({
        _id: new ObjectId(),
        title: data.title
    })
    
    column.save()
    .then(savedColumn => {

        let status = 200
        data.column = savedColumn

        if (!savedColumn){
            stats = 400
            data.message = 'Please check error to see further details'
        }
        else {
            data.saved = true
            data.message = 'success'
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).send(data)
    })
})


router.patch('/:column', Authenticate, (req,res) => {

    let data = {}

    const columnTitle = req.params.column
    const newArticleIDs = req.body.ids
    
    async function updateColumn(column, idsArray){

        const id = column._id
        const body = {
            title: column.title,
            lastUpdated: new Date().getTime(),
            articleIDs: idsArray
        }

        return await Column.updateOne( {_id:id}, {$set:body} )
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

        return updateColumn(column[0], newIDsArray)
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