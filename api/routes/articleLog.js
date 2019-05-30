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

router.post("/", Authenticate, async (req, res) => {
  const { column } = req.body;

  let { position = 0  } = req.body

  const article = new ArticleLog({
    _id: new ObjectId(),
    title: req.body.title,
    url: req.body.url,
    column
  });

  const data = {
    articleSaved: false
  };

  const log = await saveArticle(article);
  if( log == null ) {
    return res.status(400).json(data);
  };

  await ArticleLog.shiftPositions(position, column);

  const validPosition = await validatePosition(position, column)

  if (typeof (validPosition) == 'number') {
    position = validPosition
  }

  await updatePosition(log._id, position)

  data.articleSaved = true;
  data.createdArticle = log;
  data.createdArticle.position = position;

  res.status(201).json(data);

  // -----

  async function saveArticle(article){
    var log;

    try {
      log = await article.save();
    } catch (error) {
      log = null;
    } finally {
      return log;
    }
  };

  async function validatePosition(position, columnId) {
    //returns true or highest position
    const articles = await ArticleLog.find(
      { 'column': { $in: columnId } }
    )
      .select('position')
      .sort({ position: 1 })
      .lean()
      .exec();

    if (position > articles.length) {
      return articles.length
    } else {
      return true
    }
  };

  async function updatePosition(_id, position){
    let updated;

    try {
      updated = await ArticleLog.updateOne(
        { _id }, { $set: {position} }, {new: true}
      )
      .lean()
      .exec();
    } catch (error) {
      updated = null;
    } finally {
      return updated;
    }
  };
});

router.post('/archive', Authenticate, (req, res) => { Contoller.archiveArticle(req, res, ArticleLog, Column) });

router.patch("/", Authenticate, (req, res) => { Contoller.updateArticle(req, res, ArticleLog) });

router.patch("/switch", Authenticate, (req, res) => { Contoller.switchPositions(req, res, ArticleLog) });

router.delete("/", Authenticate, (req, res) => {

  const { id } = req.body;

  let data = { deleted: false };

  if ( ObjectId.isValid(id) == false ) {
    data.error = "Bad article id";
    return res.status(404).json(data);
  }

  ArticleLog.findOneAndDelete({ _id: id })
    .then(article => {

      let status = 404;

      if (article == null) {
        data.error = "Invalid request to delete";
      } else {
        data.log = article;
        data.deleted = true;
        status = 200;
      }

      res.status(status).json(data);
    })
    .catch(err => {
      data.error = err;
      res.status(501).json(data);
    });
});

module.exports = router;
