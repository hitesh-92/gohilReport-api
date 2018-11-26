// const router = require('express').Router()
const express = require('express')
const router = express.Router()
const ArticleLog = require('../models/articleLog')
const Authenticate = require('../middleware/auth').default
const mongoose = require('mongoose')

const Article = require('../models/articleLog')


// router.post('/', Authenticate, (req,res,next) => {

//     //create new ArticleLog
//     const article = new ArticleLog({
//         _id: new mongoose.Types.ObjectId(),
//         title: 'testTitle',
//         url: 'http://testsite.com'
//     })

//     //save created article to database
//     article.save().then(data => {
//         res.status(200).send({log})
//     })

// })