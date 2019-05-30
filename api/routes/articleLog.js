const express = require("express");
const router = express.Router();
const Controller = require('../controllers/articleLog');
const ArticleLog = require("../models/articleLog");
const Column = require('../models/column');
const Authenticate = require("../middleware/auth");
const mongoose = require("mongoose");
const {
  Types: { ObjectId }
} = mongoose;

router.get('/single', (req, res) => { Controller.getSingleArticle(req, res, ArticleLog) });

router.get('/archive', (req, res) => { Controller.getArchives(req, res, ArticleLog, Column) });

router.post('/', Authenticate, (req, res) => { Controller.saveNewArticle(req, res, ArticleLog) });

router.post('/archive', Authenticate, (req, res) => { Controller.archiveArticle(req, res, ArticleLog, Column) });

router.patch("/", Authenticate, (req, res) => { Controller.updateArticle(req, res, ArticleLog) });

router.patch("/switch", Authenticate, (req, res) => { Controller.switchPositions(req, res, ArticleLog) });

router.delete("/", Authenticate, (req, res) => Controller.deleteArticle(req, res, ArticleLog) );

module.exports = router;
