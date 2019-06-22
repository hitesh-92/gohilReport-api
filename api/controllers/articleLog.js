const {
  Types: {
    ObjectId
  }
} = require('mongoose');

module.exports = {
  getSingleArticle,
  saveNewArticle,
  updateArticle,
  removeImage,
  switchPositions,
  deleteArticle
}

async function getSingleArticle(req, res, ArticleLog, Column) {

  const id = req.params.id

  var data = {
    found: false
  }

  if (!(ObjectId.isValid(id))) {
    data.message = "Invalid Article ID provided";
    return res.status(400).json(data);
  }

  const [validArticle, checkColumn] = await searchForArticle(id);

  if (validArticle == false) {
    data.message = 'Invalid Article';
    return res.status(404).json(data);
  }

  const [validColumn, getData] = checkColumn();

  if (validColumn == false) {
    data.message = 'Invalid Request';
    return res.status(400).json(data);
  }

  const {
    article,
    column
  } = getData();

  data.article = article;
  data.column = column;
  data.found = true;

  res.status(200).json(data);

  // -----

  async function searchForArticle(_id) {
    let columnIndex = null;
    var columns = await fetchAllColumns();
    var article = await fetchArticle(_id);

    if (article == null) return [false, false];
    else return [true, matchArticleWithColumn];

    function matchArticleWithColumn() {
      const [match, index] = findArticleColumn(columns, article.column);

      if (match) {
        columnIndex = index;
        return [match, getData];
      } else {
        return [false, ''];
      }

    }

    function getData() {
      return {
        article,
        column: columns[columnIndex]
      };
    }

  }

  async function fetchAllColumns() {
    return await Column.find({}).select('_id title').exec();
  }

  async function fetchArticle(_id) {
    return ArticleLog.findOne({
      _id
    }).lean().exec();
  }

  function findArticleColumn(columns, toFind) {
    for (let i in columns) {
      let match = columns[i]._id.toString() == toFind;
      if (match) return [true, i];
    }
    return [false, ''];
  }
};

async function saveNewArticle(req, res, ArticleLog) {

  const {
    column
  } = req.body;
  let {
    position = 0
  } = req.body;

  const data = {
    articleSaved: false
  };

  var article = createArticle(req.body);

  if (article == null) return res.status(400).json(data);

  article.save();

  await ArticleLog.shiftPositions(position, column);

  const validPosition = await validatePosition(position, column);

  if (typeof(validPosition) == 'number') {
    position = validPosition
  };

  await updatePosition(article._id, position);

  data.articleSaved = true;
  data.createdArticle = article;

  res.status(201).json(data);

  // -----

  async function validatePosition(position, columnId) {
    //returns true or highest position
    const articles = await ArticleLog.find({
        'column': {
          $in: columnId
        }
      })
      .select('position')
      .sort({
        position: 1
      })
      .lean()
      .exec();

    if (position > articles.length) {
      return articles.length
    } else {
      return true
    }
  };

  async function updatePosition(_id, position) {
    let updated;

    try {
      updated = await ArticleLog.updateOne({
          _id
        }, {
          $set: {
            position
          }
        }, {
          new: true
        })
        .lean()
        .exec();
    } catch (error) {
      updated = null;
    } finally {
      return updated;
    }
  };

  function createArticle({
    title = '',
    url = '',
    image = '',
    position = 0,
    column
  }) {

    const validColumnId = ObjectId.isValid(column);
    if (!title || !url || !column || !validColumnId) return null;

    title = title.trim();
    url = url.trim();
    image = image.trim();

    return new ArticleLog({
      _id: new ObjectId(),
      title,
      url,
      image,
      position,
      column
    });

  }

};

async function updateArticle(req, res, ArticleLog) {

  let data = {
    status: false
  };

  const {
    title = null,
      url = null,
      image = null,
      id
  } = req.body;

  // Validations

  if (ObjectId.isValid(id) == false) {
    data.error = "Bad article id";
    return res.status(404).json(data);
  } else if (!title && !url && !image) {
    data.message = 'No title or url provided';
    return res.status(400).json(data)
  };

  const article = await fetchArticle(id);

  if (article == null) {
    data.error = {
      message: 'Unable find article with ID'
    }
    return res.status(400).json(data)
  };

  const {
    nModified: patched = null
  } = await updateArticle(id, title, url, image);

  let status = 400;

  if (patched) {
    data.status = true;
    status = 200;
  } else {
    data.error = {
      message: 'Unsuccessful update'
    }
  };

  res.status(status).json(data);

  // -----

  async function fetchArticle(_id) {
    let article;

    try {
      article = await ArticleLog.findOne({
          _id
        })
        .select('_id column')
        .lean()
        .exec();
    } catch (error) {
      article = null
    } finally {
      return article
    }
  };

  async function updateArticle(_id, title, url, image) {
    let body = {};

    if (title) body.title = title.trim();
    if (url) body.url = url.trim();
    if (image) body.image = image.trim();

    return await ArticleLog.updateOne({
      _id
    }, {
      $set: body
    });
  };

};

async function removeImage(req, res, ArticleLog) {

  const {
    id
  } = req.body;

  const data = {
    status: false
  }

  if (ObjectId.isValid(id) == false) {
    return res.status(400).json(data);
  }

  await ArticleLog.updateOne({
    _id: id
  }, {
    $set: {
      image: null
    }
  });

  data.status = true;

  res.status(200).json(data);

};

async function switchPositions(req, res, ArticleLog) {
  // make use of transactions in next major update!

  // validate Ids
  const validIds = checkIds(req.body);
  if (!validIds) {
    return res.status(400).json({
      status: false
    });
  }

  // need to fetch articles before can validate same columns
  const [checkColumns, makeSwitch] = await fetchArticles(req.body);

  if (checkColumns == 'error') return res.status(400).json({
    status: false,
    error: 'articleId'
  });
  else if (checkColumns() == false) return res.status(404).json({
    status: false,
    error: 'column'
  });

  var switched = await makeSwitch();

  if (switched) return res.json({
    status: true
  })
  else res.status(400).json({
    status: false,
    error: 'bigProblem'
  })

  // -----

  function checkIds({
    selected,
    moveTo
  }) {
    if (ObjectId.isValid(selected) == false) return false;
    if (ObjectId.isValid(moveTo) == false) return false;
    return true;
  }

  async function fetchArticles({
    selected: selectedId,
    moveTo: moveToId
  }) {

    var selectedArticle = await fetchArticle(selectedId);
    var moveToArticle = await fetchArticle(moveToId);

    const bothArticlesExits = selectedArticle != null && moveToArticle != null;

    if (bothArticlesExits) return [equalColumns, switchRequest];
    else return ['error', ''];

    function equalColumns() {
      const firstArticleColumn = selectedArticle.column.toString();
      const secondArticleColumn = moveToArticle.column.toString();
      return firstArticleColumn === secondArticleColumn;
    }

    async function switchRequest() {

      const {
        position: selectedPosition
      } = selectedArticle;

      const {
        position: moveToPosition
      } = moveToArticle;

      var {
        nModified: updatedSelected
      } = await updateArticle(selectedId, moveToPosition);
      var {
        nModified: updatedMoveTo
      } = await updateArticle(moveToId, selectedPosition);

      return updatedSelected == 1 && updatedMoveTo == 1;
    }

  }

  async function fetchArticle(_id) {
    return ArticleLog.findOne({
        _id
      })
      .select('position column')
      .lean()
      .exec();
  }

  function validateSameColumns(first, second) {
    return first.toString() == second.toString()
  }

  async function updateArticle(_id, newPosition) {
    return await ArticleLog.updateOne({
      _id
    }, {
      $set: {
        position: newPosition
      }
    }).exec();
  }

};

async function deleteArticle(req, res, ArticleLog) {
  const {
    id
  } = req.body;

  let data = {
    deleted: false
  };

  if (ObjectId.isValid(id) == false) {
    data.error = "Bad article id";
    return res.status(404).json(data);
  }

  ArticleLog.findOneAndDelete({
      _id: id
    })
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
};