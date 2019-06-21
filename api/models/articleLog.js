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
  image:{
    type: String,
    trim: true,
    default: null
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
  .updateStatus = async function updateStatus() {

    var ArticleLog = this;

    const [hasArticles, updateArticles] = await fetchArticles();

    // potential updates
    if( hasArticles === false ) return;

    const [toUpdateCount, executeUpdate] = await updateArticles();

    // ready-to-update
    if( toUpdateCount === 0 ) return;

    // return count of all nModified
    return await executeUpdate();

    // -----

    async function fetchArticles(){
      var articles = await fetchArticlesToUpdate();

      if(articles.length === 0) return [false, false];
      else return [true, updateArticles];

      async function updateArticles(){
        return await handleStatusUpdate(articles);
      };
    };

    async function fetchArticlesToUpdate(){
      return await ArticleLog.find({
        status: { $lt: 3 }
      })
      .lean()
      .select('status createdAt')
      .exec();
    };

    async function handleStatusUpdate(articles){
      var one = [], two = [], three = [];

      for(let i = 0; i < articles.length; i++){
        const { status, _id, createdAt } = articles[i];
        const toUpdate = checkArticleStatus(status, createdAt);
        if(!toUpdate) continue;

        if( status === 0 )      one.push(_id);
        else if( status === 1 ) two.push(_id);
        else if( status === 2 ) three.push(_id);
      }

      // console.log(one ,two ,three)

      const articleCount = one.length + two.length + three.length;

      return [articleCount, updateArticles]

      async function updateArticles(){
        return await updateArticleStatus([one, two, three]);
      }
    }

    function checkArticleStatus(status, createdAt){
      var check_nextUpdate =  check_addDate(createdAt);

      switch (status) {
        case 0: return check_nextUpdate(1); // 1month
        case 1: return check_nextUpdate(3); // 3month
        case 2: return check_nextUpdate(6); // 6month
        default: return false;
      }
    }

    function check_addDate(createdAt){
      return initUpdateCheck;
      function initUpdateCheck(nextUpdateMonth){
        return processUpdateCheck(nextUpdateMonth, createdAt);
      }
    }

    function processUpdateCheck(nextUpdateMonth, createdAt){
      var nextUpdate = moment(createdAt).add(nextUpdateMonth, "months");
      return moment().isAfter( nextUpdate );
    }

    async function updateArticleStatus(arrays){
      var requests = arrays.map(buildRequest);
      const saved = await Promise.all(requests);
      let totalSaved = 0;
      for (let i in saved) totalSaved += saved[i].nModified;
      return totalSaved;
    }

    function buildRequest(array, i){
      var ids = array.map( ({ _id }) => ObjectId(_id).toString() );
      return new Promise(resolve =>
        resolve( ArticleLog.updateMany(
            { '_id': { $in: ids } },
            { $inc: { status: 1 } }
        ) ));
    };





    ///////////////////////////////////////////////////
/*
    return await new Promise(updateStatus)

    async function updateStatus(resolve, reject) {
      var currentArticles = await fetchArticles()
      if (currentArticles == null) return reject(new Error('Error Fetching Articles'))

      var updateComplete = await updateArticles(currentArticles)
      if (!updateComplete) return reject(new Error('Error Updating Articles'))

      return resolve(updateComplete.length)
    };

    // -----
month_now
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

    */

  };

articleLogSchema.statics
  .shiftPositions = async function shiftPositions(insertPosition, columnId) {
    //  increment +1 all article positions below 'insertPosition'

    var ArticleLog = this;

    const updated = await updatePositions(insertPosition, columnId);
    if( updated === null) return false;
    return true;

    // -----

    async function updatePositions(incrementFrom, column){
      let updates;
      try {
        updates = await ArticleLog.updateMany(
          {
            column,
            'position': { $gte: incrementFrom }
          },
          {
            $inc: { position: 1 }
          }
        );
      } catch (err) {
        updates = null;
      } finally {
        return updates;
      }
    };


    ////////////////////////////
    // -----

    /*

    async function updateArticlePositions(resolve, reject) {

      const articles = await fetchColumnArticles(columnId, insertPosition);

      if (articles === null) {
        return reject(Error('Failed fetching articles 1'));
      };

      const updated = await updateArticles(articles);

      if (updated === null) {
        return reject(Error('Failed updating articles 2'));
      };

      if (updated !== null) {
        return resolve(true)
      } else {
        return reject(Error('Failed updating articles 3'));
      }

    };

    // -----

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
        // console.log(`ERROR:\n${error}`)
        allArticles = null
      } finally {
        return allArticles
      }
    };

    async function updateArticles(articles) {
      let updated;

      const requests = articles.map(buildRequest);

      try {
        // updated = await Promise.all(requests);
        updated = await ArticleLog.updateMany(requests);
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

    */

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
