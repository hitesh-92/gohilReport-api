const express = require("express");
const router = express.Router();
const Controller = require('../controllers/articleLog');
const ArchiveController = require('../controllers/archive');
const ArticleLog = require("../models/articleLog");
const Column = require('../models/column');
const Authenticate = require("../middleware/auth");

router.get('/:id', Authenticate, (req, res) => {
  Controller.getSingleArticle(req, res, ArticleLog, Column)
});

router.post('/', Authenticate, Controller.saveNewArticle(ArticleLog, Column));

router.post('/archive', Authenticate, (req, res) => {
  ArchiveController.archiveArticle(req, res, ArticleLog, Column)
});

router.patch('/archive/unarchive', Authenticate, ArchiveController.unarchiveArticle(ArticleLog));

router.patch("/", Authenticate, (req, res) => {
  Controller.updateArticle(req, res, ArticleLog)
});

router.patch('/removeimage', Authenticate, (req, res) => {
  Controller.removeImage(req, res, ArticleLog)
})

router.patch("/switch", Authenticate, (req, res) => {
  Controller.switchPositions(req, res, ArticleLog)
});

router.patch("/insertposition", Authenticate, Controller.insertToPosition(ArticleLog));

router.delete("/:id", Authenticate, Controller.deleteArticle(ArticleLog));

module.exports = router;