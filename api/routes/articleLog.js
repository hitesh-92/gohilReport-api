const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId


router.get('/:articleId', (req, res) => {

    /* 
        response reference:    
    
        response found property:
        null = Invalid ID
        false = no article found
        true = article found
        undefined = server error
    */ 

    const requestId = req.params.articleId

    //invalid ID
    const validID = ObjectId.isValid(requestId)
    if (!validID){
        const response = {
            found: null,
            requestId,
            status: 'Invalid Article ID' 
        }
        return res.status(400).json(response)
    }

    const findId = ObjectId.createFromHexString(requestId)

    ArticleLog.findById(findId)
        .select('title url createdAt')
        .exec()
        .then(log => {

            //response object
            let response = {
                time: new Date().toLocaleString(),
                requestId,
                found: false,
                data: log
            }

            // no document returned from find request
            if(log == null){
                return res.status(404).json(response)
            }

            //success case
            response.found = true
            return res.status(200).json(response)
        })
        .catch(e => {
            const response = {
                error: e,
                status: 'Attempt to find article not made. Contact',
                found: undefined
            }
            res.status(500).json(response)
        })

})


router.post('/', Authenticate, (req, res, next) => {

    //create new ArticleLog
    const article = new ArticleLog({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        url: req.body.url
    })

    //save created article to database and return response
    article.save()
    .then(log => {
        const response = {
            createdArticle: log,
            articleSaved: true
        }
        res.status(201).json(response)
    })
    .catch(e =>{
        const response = {
            error: e,
            articleSaved: false,
            createdArticle: null
        }
        res.status(400).json(response)
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
