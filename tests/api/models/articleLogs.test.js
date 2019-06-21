const moment = require("moment");

const {
  Types: { ObjectId }
} = require("mongoose");

const ArticleLog = require("../../../api/models/articleLog");
const { columnIds } = require("../../seedData");

const {
  columnIds: [columnId]
} = require("../../seedData");

describe("MODEL articleLog", () => {
  it("create new log", async () => {
    const body = {
      _id: new ObjectId(),
      title: "createLog",
      url: "www.has4props.com",
      column: columnId,
      image: 'https://bit.ly/2R9xD2J'
    };

    const article = new ArticleLog(body);

    const {
      _id,
      title,
      url,
      createdAt,
      updatedAt,
      column,
      image
    } = await article.save();

    assert.equal(typeof title, "string");
    assert.equal(typeof _id, "object");
    assert.equal(typeof createdAt, "object");
    assert.equal(typeof updatedAt, "object");
    assert.equal(typeof column._id, "object");
    assert.equal(typeof image, "string");
  }); //

  it("updateLogs method updates articles status", async () => {

    const [articleData, articleIds] = buildArticleData();

    await ArticleLog.insertMany(articleData);
    const count  = await ArticleLog.updateStatus();

    assert.equal(count, 3);

    var updatedArticles = await ArticleLog.find({ _id: { $in: articleIds } }).select('status').exec();

    assert.equal(updatedArticles[0]._id.toString(), articleIds[0].toString())
    assert.equal(updatedArticles[0].status, 1);

    assert.equal(updatedArticles[0]._id.toString(), articleIds[0].toString())
    assert.equal(updatedArticles[1].status, 2);

    assert.equal(updatedArticles[0]._id.toString(), articleIds[0].toString())
    assert.equal(updatedArticles[2].status, 3);

    // -----

    function buildArticleData() {
      const status = [0, 1, 2, 3];
      const monthIncrement = [1, 3, 6, 0];
      const ids = [new ObjectId(), new ObjectId(), new ObjectId()]
      const data = [
        { title: "firstPost", url: "www.oneee.com", _id: ids[0] },
        { title: "secondPost", url: "www.twoo.com", _id: ids[1] },
        { title: "thirdPost", url: "www.treee.com", _id: ids[2] }
      ];

      const createArticle = ({ title, url, _id }, status, months, column) => ({
        _id,
        title,
        url,
        status,
        column,
        createdAt: moment().subtract(months, "months").subtract(1, "days")
      });

      var articlesData = data.map((log, i) =>
        createArticle(log, status[i], monthIncrement[i], columnIds[i])
      );

      return [articlesData, ids];
    };

  });
});
