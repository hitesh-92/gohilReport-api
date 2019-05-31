const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')
const Controller = require('../controllers/column');
const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')
const mongoose = require('mongoose')
const { Types: {ObjectId}} = mongoose

router.get('/', (req, res) => { Controller.get_allColumns(req, res, ArticleLog, Column) });
router.get('/single', (req, res) => { Controller.get_singleColumn(req, res, ArticleLog, Column) });

router.post('/', Authenticate, (req, res) => {

    let data = {
        title: req.body.title,
        error: {},
        createdColumn: {},
        saved: false
    }

    if( data.title.trim().length < 4 ) {
        data.error = 'Invalid title'
        return res.status(400).json(data)
    }

    const column = new Column({
        _id: new ObjectId(),
        title: data.title.trim()
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
        res.status(500).json(data)
    })
})


router.patch('/', Authenticate, (req,res) => {

    let data = {}

    const { id: columnId, title: updateTitle } = req.body

    const findColumn = async (_id) => await Column
    .findOne( { _id } )
    .select('_id title')
    .lean()
    .exec()

    const updateColumn = async (_id, title) => await Column
    .updateOne( {_id}, { $set: {title} } )
    .exec()

    if( ObjectId.isValid(columnId) == false ) {
        res.status(400).json({error: 'Invalid id'})
        return
    }

    if( String(updateTitle).trim().length < 4 ){
        res.status(400).json({error: 'Invalid update title'})
        return
    }

    findColumn(columnId)
    .then( async (column) => {

        if (!column){
            data.error = 'No column with given id found'
            res.status(400).json(data)
            return
        }

        const savedColumn = await updateColumn(columnId, updateTitle)
        data.column = savedColumn
        res.status(200).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).json(data)
    })
})


router.delete('/', Authenticate, (req,res) => {

    const { title } = req.body

    let data = {
        deleted: false
    }

    Column
    .findOneAndDelete({ title })
    .exec()
    .then(log => {

        let status = 400

        if(log === null){
            data.message = 'Invalid Column Provided'
        } else {
            status = 200
            data.message = 'success'
            data.deleted = true
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).json(data)
    })

})

module.exports = router;
