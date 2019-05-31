const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')
const Controller = require('../controllers/column');
const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')
const mongoose = require('mongoose')
const { Types: {ObjectId}} = mongoose

router.get('/', (req, res) => { Controller.get_allColumns(req, res, ArticleLog, Column) });
router.get('/single', (req, res) => { Controller.get_singleColumn(req, res, ArticleLog, Column) });
router.post('/', (req, res) => { Controller.saveNewColumn(req, res, Column) });
router.patch('/', (req, res) => { Controller.updateColumn(req, res, Column) });
router.delete('/', (req, res) => { Controller.deleteColumn(req, res, Column) });


module.exports = router;
