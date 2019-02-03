const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

/*
    GET /
*/
//tesing - send back message:'working'
//send back data for all articles to be displayed
router.get('/', (req, res) => {
    res.status(200)
        .send({
            message: 'working'
        })
})


/*
    GET /:id
*/
//send back the log with: title, url, createdAt, _id, found
/* 
    found property:
    null = Invalid ID
    false = no article found
    true = article found
    undefined = server error
*/ 
router.get('/:articleId', (req, res) => {

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
            // console.log(`Log: ${log}`)
            // console.log(`requestId: ${requestId}`)

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


/*
    POST /
*/
//Authenticate; only user should be able to save new articles
//send back response with property createdArticle
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
    .catch(e => { //???????????????????????????
        const response = {
            error: e,
            status: 'Attempt to save article not made. Contact'
        }
        res.status(500).json(response)
    })

})


/*
    DELETE /:id
*/
//delete articleLog
//Authenticate; only user should be able to delete log from database
//use id passed passed with request
//send back object with a 'deleted' property, boolean
//if not able to delete send 404
router.delete('/:articleId', Authenticate, (req, res, next) => {

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
