const express = require("express");
const router = express.Router();
const Contoller = require('../controllers/articleLog');
const ArticleLog = require("../models/articleLog");
const Column = require('../models/column');
const Authenticate = require("../middleware/auth");
const mongoose = require("mongoose");
const {
  Types: { ObjectId }
} = mongoose;

router.get("/single", (req, res) => {
  const { id } = req.body

  var data = { found: null }

  if ( !(ObjectId.isValid(id)) ) {
    data.message = "Invalid Article ID provided";
    return res.status(400).json(data);
  }

  ArticleLog.findOne({_id: id})
    .lean()
    .exec()
    .then(log => {
      let status = 404;

      data.article = log;

      if (log == null) {
        data.message = "No Article found with given requestId";
        data.found = false;
      } else {
        data.found = true;
        status = 200;
      }

      res.status(status).json(data);
    })
    .catch(err => {
      data.error = err;
      data.message = "Server Error Processing Rquest. Contact";
      res.status(500).json(data);
    });
});

router.get('/archive', (req, res) => { Contoller.getArchives(req, res, ArticleLog, Column) });

router.post('/', Authenticate, (req, res) => { Contoller.saveNewArticle(req, res, ArticleLog) });

router.post('/archive', Authenticate, (req, res) => { Contoller.archiveArticle(req, res, ArticleLog, Column) });

router.patch("/", Authenticate, (req, res) => { Contoller.updateArticle(req, res, ArticleLog) });

router.patch("/switch", Authenticate, (req, res) => { Contoller.switchPositions(req, res, ArticleLog) });

router.delete("/", Authenticate, (req, res) => Contoller.deleteArticle(req, res, ArticleLog) );

module.exports = router;
