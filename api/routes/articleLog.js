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

    // invalid ID
    const validID = ObjectId.isValid(articleID)
    if(!validID){
        const response = {
            deleted: false,
            error: 'Bad article id'
        }
        return res.status(404).json(response)
    }

    ArticleLog
      .findOneAndDelete({_id: articleID})
      .then(data => {
        const response = {
            log: data,
            deleted: false
        }

        //article not found
        if(data == null){
            response.error = 'Invalid request to delete'
            return res.status(404).json(response)
        }

        //success
        response.deleted = true
        res.status(200).json(response)

      })
      .catch(e => {
        res.status(501).send({error: e, deleted: false})
      })

})


module.exports = router;
