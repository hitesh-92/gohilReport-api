const {
    Types: { ObjectId }
} = require('mongoose');

const getArchives = async (req, res, ArticleLog, Column) => {
    const data = {
        status: false
    }

    const columnId = await fetchColumnId();

    if (columnId == null) {
        data.error = {
            message: 'No archive column found'
        };

        return res.status(404).json(data);
    }

    const archives = await fetchArchives(columnId);

    if (archives == null) {
        data.error = {
            message: 'Error finding archived articles'
        };

        return res.status(400).json(data);
    };

    data.status = true;
    data.archives = archives;

    res.status(200).json(data);

    // -----

    async function fetchColumnId() {
        let columnId;

        try {
            const {
                _id
            } = await Column.findOne({
                    title: 'archive'
                })
                .select('_id')
                .lean()
                .exec();
            columnId = _id;
        } catch (error) {
            columnId = null;
        } finally {
            return columnId;
        }

    };

    async function fetchArchives(columnId) {
        let articles;

        try {

            articles = await ArticleLog.find({
                    'column': columnId
                })
                .select('_id title url column createdAt')
                .lean()
                .exec();

        } catch (error) {
            articles = null;
        } finally {
            return articles;
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

const archiveArticle = async (req, res, ArticleLog, Column) => {

    let data = {
        archived: false
    };

    const {
        id: articleId
    } = req.body;

    if (!(ObjectId.isValid(articleId))) {
        data.error = 'Invalid id';
        return res.status(400).send(data);
    }

    const [article, columnId] = await fetchData(articleId);

    if (
        article == null &&
        columnId == null
    ) {
        data.error = 'Error finding information with data provided';
        return res.status(404).json(data);
    } else if (article.archive != undefined) {
        data.error = 'Article is already archived';
        return res.status(400).json(data);
    }

    const {
        nModified: archived
    } = await archiveArticle(article._id, columnId);

    if (archived == null) {
        data.error = 'Error archiving article';
        return res.status(500).json(data);
    }

    const positionRemoved = await ArticleLog.removePosition(article._id)

    if (positionRemoved == null) {
        data.error = 'Error removing position from article'
        return res.status(500).json(data);
    }

    data.archived = true;
    data.message = 'Article archived';

    return res.status(200).json(data);

    // -----

    async function fetchData(articleId) {

        const fetchArticle = new Promise(resolve => {
            resolve(
                ArticleLog.findOne({
                    '_id': articleId
                })
                .select('_id archive')
                .lean()
                .exec()
            )
        });

        const fetchArchiveColumn = new Promise(resolve => {
            resolve(
                Column.findOne({
                    title: 'archive'
                })
                .select('_id')
                .lean()
                .exec()
            )
        });

        let data;

        try {
            data = await Promise.all([fetchArticle, fetchArchiveColumn]);
        } catch (error) {
            data = [null, null];
        } finally {
            return data;
        }
    };

    async function archiveArticle(articleId, columnId) {
        let archived;

        try {
            archived = await ArticleLog.updateOne({
                _id: articleId
            }, {
                $set: {
                    archive: columnId,
                    archiveDate: new Date()
                }
            }).exec();
        } catch (error) {
            archived = null;
        } finally {
            return archived;
        }
    }

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
}

module.exports = {
  getArchives,
  updateArticle,
  switchPositions,
  archiveArticle,
  deleteArticle
}
