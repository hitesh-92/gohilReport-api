const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


router.get('/:articleId', (req, res) => {

    const requestId = req.params.articleId
    
    let data = { 
        requestId,
        time: new Date().getTime(),
        found: null
    }

    //invalid ID
    const invalidID = ObjectId.isValid(requestId) === false

    if (invalidID){
        data.message = 'Invalid Article ID provided'
        res.status(400).json(data)
        return
    }

    const queryID = ObjectId.createFromHexString(requestId)

    ArticleLog.findById(queryID)
    .select('title url createdAt')
    .exec()
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

    //create new ArticleLog
    const article = new ArticleLog({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        url: req.body.url
    })

    //save created article to database and return response
    article.save()
    .then(log => {
        data.createdArticle = log
        data.articleSaved = true

        res.status(201).json(data)
    })
    .catch(err =>{
        data.error = err
        res.status(400).json(data)
    })
})


router.delete('/:articleId', Authenticate, (req, res, next) => {

    //delete articleLog
    //success: {'deleted':true}

    const articleID = req.params.articleId

    let data = {
        deleted: false
    }

    // invalid ID
    const validID = ObjectId.isValid(articleID)

    if(!validID){
        data.error = 'Bad article id'
        res.status(404).json(data)
        return
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
