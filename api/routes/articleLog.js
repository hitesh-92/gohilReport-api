const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')
const Authenticate = require('../middleware/auth')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


router.get('/:articleId', (req, res) => {
    
    const requestId = req.params.articleId
    
    let data = { 
        requestId,
        found: null
    }

    const invalidID = ObjectId.isValid(requestId) === false

    if (invalidID){
        data.message = 'Invalid Article ID provided'
        return res.status(400).json(data)
    }

    const queryID = ObjectId.createFromHexString(requestId)

    ArticleLog.findById(queryID)
    .then(log => {
        let status = 200

        data.article = log

        // no document returned from find request
        if(log === null){
            data.found = false
            data.message = 'No Article found with given requestId'
            status = 404
        } else {
            data.found = true
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = err
        data.message = "Server Error Processing Rquest. Contact"
        res.status(500).json(data)
    })

})


router.post('/', Authenticate, (req, res, next) => {

    let data = {
        articleSaved: false
    }

    const article = new ArticleLog({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        url: req.body.url
    })

    article.save()
    .then(log => {
        data.createdArticle = log
        data.articleSaved = true

        res.status(201).json(data)
    })
    .catch(err =>{
        data.error = err
        data.articleSaved = false
        res.status(400).json(data)
    })
})

router.post('/archive', (req, res) => {

    let data = {}
    const { id } = req.body

    async function archive({archiveColumn, articleColumn}, archiveID){
        //update 2 columns [articleColumn, archiveColumn]
        //update article document
        const id = mongoose.Types.ObjectId(archiveID)

        const column = new Promise(resolve => {
            const {_id, articleIDs} = articleColumn
            //splice out id from array
            const articleIDs_filtered = articleIDs.map(_id => _id !== id)

            resolve( Column.updateOne(
                {_id},
                {$set: { articleIDs: articleIDs_filtered }}
            ) )
        })

        const archive = new Promise(resolve => {
            const {_id, articleIDs} = archiveColumn
            resolve( Column.updateOne(
                {_id},
                {$set: { articleIDs: [...articleIDs, id] }}
            ) )
        })

        const article = new Promise(resolve => {
            const _id = archiveID
            const body = {
                archived: true,
                archiveDate: Date.now()
            }
            resolve( ArticleLog.updateOne(
                {_id},
                {$set: body}
            ) )
        })
        
        return await Promise.all([column, archive, article])
    }

    Column.find({})
    .select('_id title articleIDs')
    .exec()
    .then( (columns) => {
        data.archiveColumn = columns.find(col => col.title === 'archive') || null
        //not using strict equality operator. find why not working with ObjectId
        data.articleColumn = columns.find( ({articleIDs}) => articleIDs.find(_id => _id == id) ) || null
        
        return archive(data, id)
    })
    .then( ([
        {nModified: column},
        {nModified: archive},
        {nModified: article}
    ]) => {
        if (
            column === 1 &&
            archive === 1 &&
            article === 1
        ) res.status(200).json({archived: true})
    })
    .catch(err => console.error(`ERROR: /article/archive [${err}]`))
})


router.patch('/:articleId', (req, res) => {

    let data = {}

    const requestId = req.params.articleId
    const { title, url, createdAt } = req.body
    

    async function updateArticle(id, title, url, createdAt){
        let body = {}

        if( title !== undefined ) body.title = title
        if( url !== undefined ) body.url = url
        if( createdAt !== undefined ) body.createdAt = createdAt

        return await ArticleLog.updateOne( {_id:id}, {$set:body} )
    }

    ArticleLog.findById(requestId)
    .then(article => {

        if( article===null ) return null

        data.oldArticle = article
        return updateArticle(requestId, title, url, createdAt)
    })
    .then(response => {

        let status = 200

        if ( response===null ){
            data.error = {message:'Unable find article with ID'}
            status = 400
        }
        else if ( response.ok !== 1 ){
            data.error = {message:'Unsuccessful update'}
            status = 400
        }
        else data.status = true

        res.status(status).send(data)
    })
    

})


router.delete('/:articleId', Authenticate, (req, res, next) => {

    //delete articleLog
    //success: {'deleted':true}

    const articleID = req.params.articleId

    let data = { deleted: false }

    // invalid ID
    const validID = ObjectId.isValid(articleID)

    if(!validID){
        data.error = 'Bad article id'
        return res.status(404).json(data)
    }
    
    ArticleLog.findOneAndDelete({_id: articleID})
    .then(article => {
        let status = 200

        if(article == null){
            data.error = 'Invalid request to delete'
            status = 404
        }
        else {
            data.log = article
            data.deleted = true
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(501).send(data)
    })

})

module.exports = router;
