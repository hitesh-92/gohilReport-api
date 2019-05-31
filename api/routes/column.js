const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')
const Controller = require('../controllers/column');
const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

router.get('/', (req, res) => { Controller.get_allColumns(req, res, ArticleLog, Column) });
router.get('/single', (req, res) => { Controller.get_singleColumn(req, res, ArticleLog, Column) });
router.post('/', Authenticate, (req, res) => { Controller.saveNewColumn(req, res, Column) });
router.patch('/', Authenticate, (req, res) => { Controller.updateColumn(req, res, Column) });
router.delete('/', Authenticate, (req, res) => { Controller.deleteColumn(req, res, Column) });

module.exports = router;
