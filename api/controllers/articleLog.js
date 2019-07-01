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
  insertToPosition,
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

function saveNewArticle(ArticleLog, Column) {
  return async function handleSaveArticle(req, res) {

    var data = {
      articleSaved: false
    };

    // validate user input through middleware
    // check string title, url. image is optional. trim, regex, etc...
    {
      let hasTitle = req.body.hasOwnProperty('title');
      if (hasTitle && req.body.title.length < 8 || !hasTitle) return res.status(400).json(data);
    }
    { // check if has position
      let positionGiven = req.body.hasOwnProperty('position');
      if (positionGiven === false) req.body.position = 0;
    }
    { // check if position is type number
      let invalidPosition = Number.isNaN( parseInt(req.body.position) );
      if( invalidPosition ) return res.status(400).json(data).end();
    }
    // -----

    const validColumn = await validateColumnExists(req.body.column);

    if (!validColumn) return res.status(400).json({error: 'Invalid Column'})

    const [disruptsColumnPositions, articlePosition] = await validateArticlePosition(req.body);

    if (disruptsColumnPositions) {
      const updatedArticles = await ArticleLog.shiftPositions(articlePosition, req.body.column);
      if (updatedArticles === null) return console.log('ERROR UPDATING COLUMN ARTICLE POSITION');
    } else {
      if (articlePosition !== null) req.body.position = articlePosition;
    }

    const article = createArticle(req.body);
    await article.save();

    data.articleSaved = true;
    data.createdArticle = article;

    res.status(201).json(data);

    // -----

    async function validateColumnExists(columnId) {
      // var column = await fetchColumnById(columnId);
      // const columnExists = column != null;
      // return columnExists;

      var [column, archiveColumn] = await Promise.all([
        fetchColumnById(columnId),
        fetchArchiveColumn()
      ]);

      const columnNotFound = column === null;
      const archiveIdGiven = columnId === archiveColumn._id.toString();

      if( columnNotFound || archiveIdGiven ) return false;
      return true;
    };

    async function fetchColumnById(id) {
      return await Column.findOne({
        _id: id
      }).exec();
    };

    async function fetchArchiveColumn(){
      return await Column.findOne({ title: 'archive' }).lean().exec();
    }

    async function validateArticlePosition({
      position,
      column: columnId
    }) {
      // if given position is to be last in column:
      // - no need to ArticleLog.shiftPositions

      const articleCount = await fetchColumnArticlesCount(columnId);
      const endOfColumn = articleCount + 1;

      if (position === endOfColumn) return [false, null];

      const inputPositionValid = validateInputPosition(position, endOfColumn);

      if (inputPositionValid) return [true, position];
      else return [false, endOfColumn];
    };

    async function fetchColumnArticlesCount(columnId) {
      return await ArticleLog.find({
        column: columnId
      }).countDocuments();
    };

    function validateInputPosition(position, max) {
      const greaterThanDefault = position > 0;
      const withinMaxRange = position <= max;
      const inputPositionValid = greaterThanDefault && withinMaxRange;
      return inputPositionValid;
    };

    function createArticle({
      title,
      url,
      image = null,
      position,
      column
    }) {
      return new ArticleLog({
        _id: new ObjectId(),
        title,
        url,
        image,
        position,
        column
      });
    };

  };
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

function insertToPosition(ArticleLog) {
  return async function handleInsertPosition(req, res) { //console.log('12313213')

    // update column article positions +/- 1 &&
    // update relevent article positions

    { // tmp validations
      let hasId = req.body.hasOwnProperty('id');
      if (hasId === false) return res.status(400).json('need id');
    } {
      let validId = ObjectId.isValid(req.body.id);
      if (validId === false) return res.status(400).json('invalid id');
    } {
      let invalidPosition = Number.isNaN(parseInt(req.body.position));
      if (invalidPosition) return res.status(400).json('error');
    }


    const [article, validateInsertPosition] = await findArticle(req.body);

    if (article === null) return res.status(400).json({
      error: 'Invalid Article'
    });

    const validInsertPosition = await validateInsertPosition();

    if (validInsertPosition === false) return res.status(400).json({error: 'bad position'});

    const {
      ok: updatedArticles
    } = await updateColumnArticlePositions(article, req.body);

    const {
      nModified: inserted
    } = await updateArticlePosition(req.body);

    if (!inserted && !updatedArticles) return res.status(500).json({
      inserted: false
    });

    res.json({
      inserted: true
    });

    // const x = await ArticleLog.find({column:article.column}).sort({position:1}).select('title position')
    // console.log(x)

    // ----- insertArticleToPosition

    async function findArticle({
      id,
      position
    }) {
      var article = await fetchArticleById(id);
      let getColumnLength;

      if (article === null) return [article, null];

      getColumnLength = fetchColumnArticleCount(article.column);
      return [article, handleVerifyInsertPosition];

      async function handleVerifyInsertPosition() {
        let columnLength = await getColumnLength;
        const articleIsWithinRange = verifyInsertPosition(position, columnLength, article.position);
        return articleIsWithinRange;
      };
    };

    async function fetchArticleById(id) {
      return await ArticleLog.findOne({
        _id: id
      }).lean().exec();
    };

    function verifyInsertPosition(n, max, current) {
      return n >= 1 && n <= max && n !== current
    }

    async function fetchColumnArticleCount(columnId) {
      return ArticleLog.find({
          column: columnId
        })
        .countDocuments().exec();
    };

    function updateColumnArticlePositions(article, {
      position: insertPosition
    }) {
      const currentPosition = article.position;
      const insertToHigherPosition = insertPosition < currentPosition;
      // if insertToHigherPosition -> inc articles positions
      // else dec articles positions

      if (insertToHigherPosition) {
        return incrementArticlePositionsWithinRange(article.column, insertPosition, currentPosition);
      } else {
        return decrementArticlePositionsWithinRange(article.column, currentPosition, insertPosition);
      }
    };

    async function incrementArticlePositionsWithinRange(columnId, min, max) {
      return await ArticleLog.updateMany({
        column: columnId,
        position: {
          $gte: min,
          $lte: max
        }
      }, {
        $inc: {
          position: 1
        }
      }).exec();
    };

    async function decrementArticlePositionsWithinRange(columnId, min, max) {
      return await ArticleLog.updateMany({
        column: columnId,
        position: {
          $gte: min,
          $lte: max
        }
      }, {
        $inc: {
          position: -1
        }
      }).exec();
    };

    async function updateArticlePosition({
      id,
      position
    }) {
      return await ArticleLog.updateOne({
        _id: id
      }, {
        $set: {
          position
        }
      });
    };

  }
};

function deleteArticle(ArticleLog) {
  return async function handleDeleteArtcile(req, res) {

    { //tmp validations
      let hasId = req.params.hasOwnProperty('id');
      if (hasId === false) return res.status(404).json({
        deleted: false,
        error: 'Bad article id'
      });
    } {
      let validId = ObjectId.isValid(req.params.id);
      if (validId === false) return res.status(404).json({
        deleted: false,
        error: 'Bad article id'
      });
    } //end validations


    const [validArticle, deleteArticle] = await findArticle(req.params);

    if (validArticle === false) return res.status(404).json({
      deleted: false,
      error: 'Invalid request to delete'
    });

    const deleted = await deleteArticle();

    res.json({
      deleted: true
    });

    // -----

    async function findArticle({
      id
    }) {
      var article = await fetchArticleById(id);

      if (article === null) return [false, null];
      else return [true, handleDeleteArticle];

      async function handleDeleteArticle() {
        return await deleteArticleById(id);
      }
    }

    async function fetchArticleById(id) {
      return await ArticleLog.findOne({
        _id: id
      }).lean().exec();
    }

    async function deleteArticleById(id) {
      return await ArticleLog.findOneAndDelete({
        _id: id
      }).exec();
    }

  }


  // let data = {
  //   deleted: false
  // };
  //
  // ArticleLog.findOneAndDelete({
  //     _id: id
  //   })
  //   .then(article => {
  //
  //     let status = 404;
  //
  //     if (article == null) {
  //       data.error = "Invalid request to delete";
  //     } else {
  //       data.log = article;
  //       data.deleted = true;
  //       status = 200;
  //     }
  //
  //     res.status(status).json(data);
  //   })
  //   .catch(err => {
  //     data.error = err;
  //     res.status(501).json(data);
  //   });
}
