var path = require('path');
const { app } = require(path.resolve() + '/app.js');
const ArticleLog = require(path.resolve() + '/api/models/articleLog');
const { ObjectId } = require("mongoose").Types;
const {
  articles,
  logInToken,
  columnIds: [leftColumnId, , , archiveColumnId],
  insertExtraArticles
} = require(path.resolve() + '/tests/seedData');



describe("/article/:id GET", () => {

  it("find saved article", async () => {
    const article = articles[0];

    const {
      body: {
        found,
        article: {
          title
        }
      }
    } = await get_requestArticleRoute(article._id, 200);

    assert.strictEqual(found, true);
    assert.strictEqual(title, article.title);
  });

  it("reject invalid id", async () => {
    const badId = "123456";

    const {
      body: {
        found,
        message
      }
    } = await get_requestArticleRoute(badId, 400)

    assert.equal(found, false)
    assert.equal(message, "Invalid Article ID provided")
  });

  it("not find article", async () => {
    const {
      body: {
        found,
        message
      }
    } = await get_requestArticleRoute(new ObjectId(), 404);

    assert.equal(found, false);
    assert.equal(message, 'Invalid Article');
  });

  it("respond with article and column", async () => {

    const id = articles[0]._id.toHexString();

    const {
      body: {
        article,
        found,
        column
      }
    } = await get_requestArticleRoute(id, 200)

    assert.equal(article._id.toString(), id);
    assert.equal(found, true);
    assert.equal(ObjectId.isValid(column._id), true);

  });

});


async function get_requestArticleRoute(id, expectStatus) {
  return await request(app)
    .get(`/article/${id}`)
    .set("x-auth", logInToken)
    .expect(expectStatus);
};
