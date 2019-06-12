const {
    Types: { ObjectId }
} = require('mongoose');

const getSingleArticle = (req, res, ArticleLog) => {

  const id = req.params.id

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
};

const saveNewArticle = async (req, res, ArticleLog) => {
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
};

const updateArticle = async (req, res, ArticleLog) => {
    let data = {
        status: false
    };

    const {
        title = null,
        url = null,
        id = null
    } = req.body;

    if (
        title == null &&
        url == null
    ) {
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
    } = await updateArticle(id, title, url);

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

    async function updateArticle(_id, title, url) {
        let body = {};

        if (title) body.title = title;
        if (url) body.url = url;

        return await ArticleLog.updateOne({
            _id
        }, {
            $set: body
        });
    };

};

const switchPositions = async (req, res, ArticleLog) => {

    const {
        selected,
        moveTo
    } = req.body;

    const idsValid = validateId(selected.id) == validateId(moveTo.id);

    if (!idsValid) {
        return res.status(400).json({
            status: false
        });
    }

    const selectedRequest = switchRequest(selected);
    const moveToRequest = switchRequest(moveTo);

    const [{
            nModified: selectedSwitched
        },
        {
            nModified: moveToSwitched
        }
    ] = await Promise.all([selectedRequest, moveToRequest]);

    if (selectedSwitched && moveToSwitched) {
        return res.status(200).json({
            status: true
        })
    }

    // -----

    function validateId(id) {
        return ObjectId.isValid(id) == true;
    }

    async function switchRequest({
        id: _id,
        position
    }) {
        return new Promise(resolve => {
            resolve(
                ArticleLog.updateOne({
                    _id
                }, {
                    $set: {
                        position
                    }
                })
            );
        });
    };

};

const deleteArticle = async(req, res, ArticleLog) => {
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
};

module.exports = {
  getSingleArticle,
  saveNewArticle,
  updateArticle,
  switchPositions,
  deleteArticle
}
