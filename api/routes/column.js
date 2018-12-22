const router = require('express').Router()
const Authenticate = require('../middleware/auth')

const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

const ObjectId = require('mongoose').Types.ObjectId

/*
    GET /
*/
router.get('/', Authenticate, (req,res) => {
    res.status(200)
        .send({
            title: 'ColumnTitle'
        })
});

module.exports = router;