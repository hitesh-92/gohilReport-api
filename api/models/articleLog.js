const mongoose = require("mongoose");
const moment = require("moment");
const {
  Schema,
  Types: {
    ObjectId
  }
} = mongoose;

const articleLogSchema = new Schema({
  _id: Schema.Types.ObjectId,
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 0
  },
  archive: {
    type: Schema.Types.ObjectId
  },
  archiveDate: {
    type: Schema.Types.Date
  },
  position: {
    type: Number,
    default: 0
  },
  column: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "column"
  }
}, {
  timestamps: true
});

articleLogSchema.statics
  .updateStatus = async function () {
    var ArticleLog = this;

    return await new Promise(updateStatus)

    async function updateStatus(resolve, reject) {
      var currentArticles = await fetchArticles()
      if (currentArticles == null) return reject(new Error('Error Fetching Articles'))

      var updateComplete = await updateArticles(currentArticles)
      if (!updateComplete) return reject(new Error('Error Updating Articles'))

      return resolve(updateComplete.length)
    };

    // -----

    async function fetchArticles() {
      var result;
      try {
        result = await ArticleLog.find({
            status: {
              $lt: 3
            }
          })
          .select("_id status createdAt")
          .exec()
      } catch (err) {
        result = null
      } finally {
        return result;
      }
    };

    async function updateArticles(logs) {
      var articlesToUpdate = logs.map(updateCheck).filter(filterQueryies);

      var saved;
      try {
        saved = await Promise.all(articlesToUpdate)
      } catch (err) {
        saved = err
      } finally {
        return saved
      }

      // -----

      function updateCheck(log) {
        var updateData = checkStatus(log)
        if (updateData) return updateQuery(updateData)
      };

      function updateQuery({
        _id,
        status
      }) {
        return new Promise(resolve => {
          resolve(
            ArticleLog.updateOne({
              _id
            }, {
              $set: {
                status
              }
            })
          );
        });
      };

      function filterQueryies(query) {
        if (!(query == null)) return query;
      };

    };

    function checkStatus({
      _id,
      status,
      createdAt
    }) {
      const compose = (nxt, inc) => m => inc(nxt(m));
      const nextUpdate = months => moment(createdAt).add(months, "months");
      const toIncrease = nextUpdate => moment().isAfter(nextUpdate);

      const processUpdateCheck = compose(
        nextUpdate,
        toIncrease
      );

      const check = (nextUpdate, newStatus) =>
        processUpdateCheck(nextUpdate) ? {
          _id: ObjectId(_id),
          status: newStatus
        } :
        false;

      switch (status) {
        case 0:
          return check(1, 1);
        case 1:
          return check(3, 2);
        case 2:
          return check(6, 3);
        default:
          return false;
      };
    };
  };

articleLogSchema.statics
  .shiftPositions = async function (insertPosition, columnId) {
    //  increment +1 all article positions below 'insertPosition'

    var ArticleLog = this;

    return new Promise(updateArticlePositions)

    // -----

    async function updateArticlePositions(resolve, reject) {
      const articles = await fetchColumnArticles(columnId, insertPosition);
      if (articles == null) {
        return reject(Error('Failed fetching articles 1'));
      };

      const updated = await updateArticles(articles);
      if (updated == null) {
        return reject(Error('Failed updating articles 2'));
      };

      if (updated != null) {
        return resolve(true)
      } else {
        return reject(Error('Failed updating articles 3'));
      }
    };

    //

    async function fetchColumnArticles(columnId, insertPosition) {
      let allArticles;

      try {
        allArticles = await ArticleLog
          .find({
            'column': columnId,
            position: {
              $gte: insertPosition
            }
          })
          .select('_id position')
          .sort({
            position: 1
          })
          .lean()
          .exec();
      } catch (error) {
        console.log(`ERROR:\n${error}`)
        allArticles = null
      } finally {
        return allArticles
      }
    };

    async function updateArticles(articles) {
      let updated;

      const requests = articles.map(buildRequest);

      try {
        updated = await Promise.all(requests);
      } catch (error) {
        updated = null;
      } finally {
        return updated;
      }

      function buildRequest({
        _id,
        position
      }) {
        return new Promise(resolve => {
          resolve(ArticleLog.updateOne({
            _id
          }, {
            $set: {
              position: position + 1
            }
          }));
        });
      };
    };

  };

articleLogSchema.statics
  .removePosition = async function (articleId) {

    var ArticleLog = this;

    return new Promise(removePosition);

    // -----

    async function removePosition(resolve, reject) {
      const article = await fetchArticle(articleId);

      if (article == null) {
        reject(Error('Failed fetching article'));
      }

      const columnArticles = await fetchColumnArticles(article[0].column);

      if (columnArticles == null) {
        reject(Error('Failed fetching articles matching column id'));
      }

      const updated = await updatePositions(article, columnArticles);

      if (updated == null) {
        reject(Error('Failed updating article positions'));
      }

      const removedArticlePosition = await updateArticle(articleId);

      if (removedArticlePosition == null) {
        reject('Failed setting article position tp -1')
      }

      resolve(true);

    };

    // -----

    async function fetchArticle(_id) {
      try {
        return await ArticleLog.find({
            _id
          })
          .select('_id position column')
          .lean()
          .exec();

      } catch (error) {
        return null
      }
    };

    async function fetchColumnArticles(columnId) {
      try {
        return await ArticleLog.find({
            'column': columnId
          })
          .select('_id position')
          .sort({
            position: 1
          })
          .lean()
          .exec();

      } catch (error) {
        return null
      }
    };

    async function updatePositions(
      [{
        _id: articleId
      }],
      articles
    ) {

      // slice articles array from where id is found
      // update all with positions-=1 

      const articlePosition = findPosition(articles, articleId);

      const articlesToUpdate = articles.slice(articlePosition);

      // console.log(articlesToUpdate);

      const updateRequests = articlesToUpdate.map(updateArticleData)

      try {
        return await Promise.all(updateRequests);
      } catch (error) {
        return null;
      }

      // -----

      function findPosition(arr, id) {
        let stringId = id.toString();

        for (let i = 0; i < arr.length; i++) {
          if (arr[i]._id.toString() == stringId) {
            return i + 1
          }
        }

        return null;
      };

      function updateArticleData({
        _id,
        position
      }) {
        return new Promise(resolve => {
          resolve(
            ArticleLog.updateOne({
              _id
            }, {
              $set: {
                position: Number(position) - 1
              }
            })
          )
        });
      };

    };

    async function updateArticle(_id) {

      try {
        return await ArticleLog.updateOne({
          _id
        }, {
          $set: {
            position: -1
          }
        });
      } catch (error) {
        return null;
      }

    };

  };

module.exports = mongoose.model("articleLog", articleLogSchema);