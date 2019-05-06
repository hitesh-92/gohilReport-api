const express = require("express");
const router = express.Router();
const ArticleLog = require("../models/articleLog");
const Column = require("../models/column");
const Authenticate = require("../middleware/auth");
const mongoose = require("mongoose");
const {
  Types: { ObjectId }
} = mongoose;

router.get("/single", (req, res) => {
  const { id } = req.body

  let data = { found: null }

  if ( ObjectId.isValid(id) == false ) {
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

router.post("/", Authenticate, (req, res) => {
  const { title, url, column } = req.body;

  let data = {
    articleSaved: false
  };

  const article = new ArticleLog({
    _id: new ObjectId(),
    title,
    url,
    column
  });

  article
    .save()
    .then(log => {
      data.createdArticle = log;
      data.articleSaved = true;

      res.status(201).json(data);
    })
    .catch(err => {
      data.error = err;
      res.status(400).json(data);
    });
});

router.post("/archive", Authenticate, (req, res) => {

  let data = {
    archived: false
  };

  const { id: articleId } = req.body;

  if ( ObjectId.isValid(articleId) == false ) {
    res.status(400).send({ error: "Invalid id" })
    return
  }

  const fetchArticle = async (_id) =>
    await ArticleLog.findOne({ _id })
      .select("_id archive")
      .exec();

  const fetchArchiveColumn = async () =>
    await Column.findOne({ title: "archive" })
      .select("_id")
      .exec();

  const fetchData = async () => {
    const article = await fetchArticle(articleId);
    const { _id } = await fetchArchiveColumn();
    return [article, _id];
  };

  fetchData()
    .then(async ([article, columnId]) => {

      if (article.archive != undefined) {
        data.error = "Article is already archived";
        res.status(400).json(data);
        return;
      }

      const { nModified } = await ArticleLog.updateOne(
        { _id: article._id },
        {
          $set: {
            archive: columnId,
            archiveDate: new Date()
          }
        }
      );

      let status = 501;

      //nModified should be 1 if archive successful
      if (nModified) {
        data.archived = true;
        data.message = "Article archived";
        status = 200;
      } else {
        data.error = "Error archiving article";
      }

      res.status(status).json(data);
    })
    .catch(err => res.status(500).json({ error: err }));
});

router.patch("/", Authenticate, (req, res) => {
  let data = { status: false };

  const { 
    title = null,
    url = null,
    id = null
  } = req.body;

  async function updateArticle(_id, title, url) {
    let body = {};

    if (title) body.title = title;
    if (url) body.url = url;

    return await ArticleLog.updateOne({ _id   }, { $set: body });
  }

  if( title == null && url == null ) {
    data.message = 'No title or url provided';
    return res.status(400).json(data)
  }

  ArticleLog.findById(id)
    .select('_id')
    .exec()
    .then(article => {
      if ( article == null ) return;
      return updateArticle(id, title, url);
    })
    .then( ({
      nModified: patched = null
    } = {}) => {
      
      let status = 200;

      if ( patched == null ) {
        data.error = { message: 'Unable find article with ID' };
        status = 400;
      } else if ( !patched ) {
        data.error = { message: 'Unsuccessful update' };
        status = 400;
      } else {
        data.status = true;
      }

      res.status(status).send(data);
    });
});

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
