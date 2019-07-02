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


describe("/article/ DELETE", () => {

  it("delete exisitng article", async () => {

    const id = articles[1]._id;

    const {
      body: {
        deleted
      }
    } = await delete_requestArticleRoute(id, 200);

    assert.equal(deleted, true)
  });

  it("reject invaid id", async () => {

    const id = "!000000f7cad342ac046AAAA";

    const {
      body: {
        deleted,
        error
      }
    } = await delete_requestArticleRoute(id, 404);

    assert.equal(deleted, false);
    assert.equal(error, "Bad article id");
  });

  it("not find article with non-existing id", async () => {

    const id = new ObjectId();

    const {
      body: {
        deleted,
        error
      }
    } = await delete_requestArticleRoute(id, 404);

    assert.equal(deleted, false);
    assert.equal(error, "Invalid request to delete");
  });
});


async function delete_requestArticleRoute(id, expectedStatus) {
  return await request(app)
    .delete(`/article/${id}`)
    .set("x-auth", logInToken)
    .expect(expectedStatus)
};
