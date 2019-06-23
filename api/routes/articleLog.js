const express = require("express");
const router = express.Router();
const Controller = require('../controllers/articleLog');
const ArchiveController = require('../controllers/archive');
const ArticleLog = require("../models/articleLog");
const Column = require('../models/column');
const Authenticate = require("../middleware/auth");

router.get('/:id', (req, res) => {
  Controller.getSingleArticle(req, res, ArticleLog, Column)
});

router.get('/archive', (req, res) => {
  ArchiveController.getArchives(req, res, ArticleLog, Column)
});

router.post('/', Authenticate, (req, res) => {
  Controller.saveNewArticle(req, res, ArticleLog)
});

router.post('/archive', Authenticate, (req, res) => {
  ArchiveController.archiveArticle(req, res, ArticleLog, Column)
});

router.patch('/archive/unarchive', Authenticate, ArchiveController.unarchiveArticle(ArticleLog) );

router.patch("/", Authenticate, (req, res) => {
  Controller.updateArticle(req, res, ArticleLog)
});

router.patch('/removeimage', Authenticate, (req, res) => {
  Controller.removeImage(req, res, ArticleLog)
})

router.patch("/switch", Authenticate, (req, res) => {
  Controller.switchPositions(req, res, ArticleLog)
});

router.delete("/", Authenticate, (req, res) => Controller.deleteArticle(req, res, ArticleLog));

module.exports = router;
