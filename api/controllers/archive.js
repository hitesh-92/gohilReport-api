const {
  Types: {
    ObjectId
  }
} = require('mongoose');

module.exports = {
  getArchives,
  archiveArticle,
  unarchiveArticle
}

async function getArchives(req, res, ArticleLog, Column) {
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
    try {
      var {
        _id: columnId
      } = await Column.findOne({
          title: 'archive'
        })
        .select('_id')
        .lean()
        .exec();
    } catch (error) {
      var columnId = null;
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

async function archiveArticle(req, res, ArticleLog, Column) {

  var data = {
    archived: false
  };

  const [validId, articleId] = validateId(req.body);

  if (!validId) {
    data.error = 'Invalid id';
    return res.status(400).json(data);
  };

  var [validArticle, isArchived, archiveArticle] = await fetchArticle(articleId);

  if (!validArticle) {
    data.error = 'Error finding information with data provided';
    return res.status(404).json(data);
  } else if (isArchived) {
    data.error = 'Article is already archived';
    return res.status(400).json(data);
  }

  const hasArchived = await archiveArticle();

  if (!hasArchived) {
    data.error = 'Error removing position from article';
    return res.status(500).json(data);
  }

  data.archived = true;
  data.message = 'Article archived';

  return res.status(200).json(data);

  // -----

  function validateId({
    id
  }) {
    const isValid = ObjectId.isValid(id) === true;
    return [isValid, id];
  }

  async function fetchArticle(articleId) {

    var [archiveColumn, article] = await Promise.all([
      fetchColumnByName('archive'),
      fetchArticleById(articleId)
    ]);

    const validArticle = article !== null;
    const isArchived = archiveColumn._id.toString() === article.column.toString();

    if (!validArticle) return [false, null, null];
    else if (isArchived) return [true, true, null];
    else return [true, false, archiveArticle];

    async function archiveArticle() {
      const archiveId = archiveColumn._id;
      return await ArticleLog.archive(article, archiveId);
    }

  }

  async function fetchColumnByName(title) {
    return await Column.findOne({
        title
      })
      .lean()
      .exec();
  }

  async function fetchArticleById(_id) {
    return await ArticleLog.findOne({
        _id
      })
      .lean()
      .exec();
  }

};

function unarchiveArticle(ArticleLog){
  return async function handleUnarchive(req, res){

    const [validId, id] = validateId(req.body);

    if ( !validId ) return;

    const [validArticle, unarchive] = await fetchArticles(id);

    if( !validArticle ) return;

    const {
      nModified: updated
    } = await unarchive()

    if( updated !== 1 ) return;

    res.json({unarchived: true});

    // -----

    function validateId({id}){
      const isValid = ObjectId.isValid(id)
      return [isValid, id];
    }

    async function fetchArticles(id){

      var article = await fetchArticleById(id);
      var columnArticles;

      const invalidArticle = article === null;
      const isArchived = article.columnRef === null

      if( invalidArticle || isArchived ) return [false, null];

      columnArticles = fetchColumnArticles(article.columnRef);

      return [true, restoreArticle];

      async function restoreArticle(){
        let newPosition;

        {
          columnArticles = await columnArticles;
          newPosition = columnArticles.length + 1;
        }

        return await unarchiveArticle(article, newPosition);
      }

    }

    async function fetchArticleById(_id){
      return await ArticleLog.findOne({ _id }).lean().exec();
    };

    async function fetchColumnArticles(column){
      return await ArticleLog.find({ column }).lean().exec();
    };

    async function unarchiveArticle({_id, columnRef}, position){
      return await ArticleLog.updateOne(
        { _id: id },
        { $set: {
          column: columnRef,
          columnRef: null,
          position: position
        } }
      );

    };

  }
};
