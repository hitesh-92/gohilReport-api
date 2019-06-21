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
  },
  columnRef: {
    type: String
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

  };

articleLogSchema.statics
  .shiftPositions = async function shiftPositions(insertPosition, columnId) {
    //  increment all article positions below 'insertPosition' by 1

    var ArticleLog = this;

    const updated = await updatePositions(insertPosition, columnId);
    if( updated === null) return false;
    return true;

    // -----

    async function updatePositions(incrementFrom, column){
      try {
        var updates = await ArticleLog.updateMany(
          {
            column,
            'position': { $gte: incrementFrom }
          },
          {
            $inc: { position: 1 }
          }
        );
      } catch (err) {
        var updates = null;
      } finally {
        return updates;
      }
    };

  };

articleLogSchema.statics
  .archive = async function archiveSingleArticle(
    {
      _id,
      position,
      column
    },
    archiveColumnId
  ) {
    // archive article
    // increment all position after article by 1

    var ArticleLog = this;

    const [
      { nModified: articlesUpdated },
      { nModified: hasArchived }
    ] = await Promise.all([
      updateColumnArticles(column, position),
      archiveArticle(_id, column, archiveColumnId)
    ]);

    const hasUpdated = articlesUpdated > 0;
    const archived = hasArchived === 1;

    if(hasUpdated && archived) return true;
    return false;

    // -----

    async function updateColumnArticles(columnId, updateFrom){
      return await ArticleLog.updateMany(
        {
          column: columnId,
          position: { $gt: parseInt(updateFrom) }
        },
        { $inc: { position: 1 } }
      );
    };

    async function archiveArticle(id, columnRef, archiveId){
      return await ArticleLog.updateOne(
        { '_id': id },
        { $set: {
          column: archiveId,
          columnRef: columnRef,
          position: null
        } }
      );
    };

  };

module.exports = mongoose.model("articleLog", articleLogSchema);
