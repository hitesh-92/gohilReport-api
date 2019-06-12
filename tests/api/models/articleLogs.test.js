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

  it("updateLogs method updates articles status", () => {
    const buildArticleData = () => {
      const status = [0, 1, 2, 3];
      const monthIncrement = [1, 3, 6, 0];
      const data = [
        { title: "firstPost", url: "www.oneee.com" },
        { title: "secondPost", url: "www.twoo.com" },
        { title: "thirdPost", url: "www.treee.com" }
      ];

      const createArticle = ({ title, url }, status, months, column) => {
        const time = moment()
          .subtract(months, "months")
          .subtract(1, "days");

        return new ArticleLog({
          _id: ObjectId(),
          title,
          url,
          status,
          column,
          createdAt: time
        });
      };

      return data.map((log, i) =>
        createArticle(log, status[i], monthIncrement[i], columnIds[i])
      );
    };

    const saveArticles = async logs => {
      for (let log of logs) await log.save();
    };

    const articleData = buildArticleData();
    const articleIDs = articleData.map(log => log._id);

    return saveArticles(articleData)
      .then(() => ArticleLog.updateStatus())
      .then(async (count) => {
        const data = await ArticleLog.find({ _id: { $in: articleIDs } })
          .select("status")
          .exec();

        assert.equal(data[0].status, 1);
        assert.equal(data[1].status, 2);
        assert.equal(data[2].status, 3);
        assert.equal(count, 3);
      });
  });
});
