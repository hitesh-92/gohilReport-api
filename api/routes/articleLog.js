// const router = require('express').Router()
const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth')
const {mongoose} = require('../../db/mongoose')


//tesing - send back messge
//
//send back data for all articles to be displayed
router.get('/', (req, res) => {
    res
      .status(200)
      .send({
          message: 'working'
      })
})


//retrieve log from databse using _id provided with request
//send back the log with title,url,createdAt and _id provided with request
router.get('/:articleLogID', (req, res) => {

    const articleID = req.params.articleLogID

    ArticleLog
      .findById(articleID)
      .select('title url createdAt')
      .exec()
      .then(log => {

        //case for log not found
        if(!log) return res.status(404).send({found: false, _id: articleID})

        //success case
        res
          .status(200)
          .send({
              found: true,
              data: log
          })

      })
      .catch(e => res.send(500).send({e, message: 'Attempt to find article not made'}))

})


//save new article to database
//use data passed with request (title and url / create new ObjectId)
//send back data including created articleLog
router.post('/', Authenticate, (req, res, next) => {

    //create new ArticleLog
    const article = new ArticleLog({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        url: req.body.url
    })

    //save created article to database and return response
    article
        .save()
        .then(log => 
        {

            res.status(201).send({
                createdArticle:{
                    _id: log._id,
                    title: log.title,
                    url: log.url,
                    createdAt: log.createdAt
                },
                articleSaved: true
            })

        })
        .catch(e => res.status(400).send({e, articleSaved: false}) )

})



module.exports = router;
