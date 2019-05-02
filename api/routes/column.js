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


router.patch('/', Authenticate, (req,res) => {
    
    let data = {}
    
    const { id: columnId, title: updateTitle } = req.body
    
    const findColumn = async (_id) => await Column
    .findOne( { _id } )
    .select('_id title')
    .exec()

    const updateColumn = async (_id, title) => await Column
    .updateOne( {_id}, { $set: {title} } )
    .exec()


    const isValidId = ObjectId.isValid(columnId)

    if( isValidId === false ) {
        res.status(400).send({error: 'Invalid id'})
        return
    }

    if( String(updateTitle).trim().length < 4 ){
        res.status(400).send({error: 'Invalid update title'})
        return
    }

    findColumn(columnId)
    .then( async (column) => {

        if (!column){
            data.error = 'No column with given id found'
            res.status(400).send(data)
            return
        }

        const savedColumn = await updateColumn(columnId, updateTitle)
        data.column = savedColumn
        res.status(200).send(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).send(data)
    })
})


router.delete('/:column', Authenticate, (req,res) => {

    const columnSelected = req.params.column

    let data = {
        deleted: true,
        message: 'success'
    }

    Column.findOneAndDelete({title: columnSelected})
    .exec()
    .then(log => {

        let status = 200
        
        if(log === null){
            status = 400
            data.message = 'Invalid Column Provided'
            data.deleted = false
        }
            
        res.status(status).send(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).send(data)
    })

})

module.exports = router;