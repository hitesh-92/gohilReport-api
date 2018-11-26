// const router = require('express').Router()
const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth')
const mongoose = require('mongoose')

const Article = require('../models/articleLog')


router.post('/', Authenticate, (req,res,next) => {

    //create new ArticleLog
    const article = new ArticleLog({
        _id: new mongoose.Types.ObjectId(),
        title: 'testTitle',
        url: 'http://testsite.com'
    })

    //save created article to database and return response
    article
        .save()
        .then(articleData => {
            res.status(201).send({
                articleData,
                added: true
            })

        })
        .catch(e => res.status(400).send(e) )

})



module.exports = router;
