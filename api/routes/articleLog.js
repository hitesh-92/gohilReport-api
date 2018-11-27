// const router = require('express').Router()
const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth')
const {mongoose} = require('../../db/mongoose')

router.get('/', Authenticate, (req, res) => {
    res
      .status(200)
      .send({
          message: 'working'
      })
})

router.post('/', Authenticate, (req, res, next) => {

    //create new ArticleLog
    const article = new ArticleLog({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.title,
        url: req.body.url
    })

    // console.log(article)
   
    //save created article to database and return response
    article
        .save()
        .then(log => {

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
