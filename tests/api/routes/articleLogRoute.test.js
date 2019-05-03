const { app } = require("../../../app");
const mongoose = require("mongoose");
const {
  Types: { ObjectId }
} = mongoose;

const {
  articles,
  logInToken,
  columnIds: [leftColumnId]
} = require("../../seedData");
const ArticleLog = require("../../../api/models/articleLog");
const Column = require("../../../api/models/column");

const request = require("supertest");
const assert = require("assert");

describe("article/ Routes", () => {
  describe("GET /:articleId", () => {
    it("retrieve saved ArticleLog using _id", () => {
      const article = articles[0];
      const id = article._id.toHexString();
      const uri = `/article/${id}`;

      return request(app)
        .get(uri)
        .expect(200)
        .then(({ body: { found, article: { title } } }) => {
          assert.equal(found, true);
          assert.equal(title, article.title);
        });
    });

    it("Bad ID results in not found", () => {
      const badID = "123456";

      return request(app)
        .get(`/article/${badID}`)
        .expect(400)
        .then(({ found }) => {
          assert.equal(found, null);
        });
    });
  });

  describe("POST /", () => {
    it("create and save new article", () => {
      const articleData = {
        title: "return201",
        url: "www.201.com",
        column: leftColumnId
      };

      return request(app)
        .post("/article/")
        .set("x-auth", logInToken)
        .send(articleData)
        .expect(201)
        .then(({ body: { articleSaved } }) => {
          assert.equal(articleSaved, true);
        });
    }); //

    it("does not saved article with invalid data", () => {
      const articleData = {
        title: false,
        url: undefined,
        column: leftColumnId
      };

      return request(app)
        .post("/article/")
        .set("x-auth", logInToken)
        .send(articleData)
        .expect(400)
        .then(({ body: { articleSaved } }) => {
          assert.equal(articleSaved, false);
        });
    }); //

    it("save new Article, find in db using response _id", () => {
      const data = {
        title: "return 2019",
        url: "www.2019.com",
        column: leftColumnId
      };

      return request(app)
        .post("/article/")
        .set("x-auth", logInToken)
        .send(data)
        .expect(201)
        .then(({ body: { createdArticle: { _id } } }) => {
          ArticleLog.findById(_id).then(({ title, url }) => {
            assert.equal(title, data.title);
            assert.equal(url, data.url);
          });
        });
    }); //
  });

  describe("PATCH /:articleId", () => {
    it("updates article title/url", () => {
      const hex_id = articles[0]._id.toHexString();

      const data = {
        title: "one uno eno noe",
        url: "http://wwww.oneoneone.com",
        column: leftColumnId
      };

      return request(app)
        .patch(`/article/${hex_id}`)
        .set("x-auth", logInToken)
        .send(data)
        .expect(200)
        .then(({ body: { status } }) => {
          assert.equal(status, true);
        });
    });
  });

  describe("DELETE /:articleId", () => {
    it("should delete exisitng article", () => {
      const id = articles[1]._id;

      return request(app)
        .delete(`/article/`)
        .set("x-auth", logInToken)
        .send({ id })
        .expect(200)
        .then(({ body: { deleted, log: { _id } } }) => {
          assert.equal(deleted, true);
          assert.equal(_id, id);
        });
    }); //

    it("reject invaid id", () => {
      const id = "!000000f7cad342ac046AAAA";

      return request(app)
        .delete("/article/")
        .set("x-auth", logInToken)
        .send({ id })
        .expect(404)
        .then(({ body: { deleted, error } }) => {
          assert.equal(deleted, false);
          assert.equal(error, "Bad article id");
        });
    }); //

    it("not find article with non-existing id", () => {
      const id = "1a00aaa111aaaa1111a111a1";

      return request(app)
        .delete("/article/")
        .set("x-auth", logInToken)
        .send({ id })
        .expect(404)
        .then(({ body: { deleted, error } }) => {
          assert.equal(deleted, false);
          assert.equal(error, "Invalid request to delete");
        });
    });
  });

  describe("/archive/ Routes", () => {
    it("archive existing article", async () => {
      const archiveID = articles[2]._id;

      const {
        body: { archived, message }
      } = await request(app)
        .post("/article/archive")
        .set("x-auth", logInToken)
        .send({ id: archiveID })
        .expect(200);

      assert.equal(message, "Article archived");
      assert.equal(archived, true);

      const { archive, archiveDate } = await ArticleLog.findOne({
        _id: archiveID
      })
        .select("archive archiveDate")
        .exec();

      assert.equal(ObjectId.isValid(archive), true);
      assert.equal(typeof archiveDate, "object");
    }); //

    it("not archive existing archive", async () => {
      const archiveID = articles[6]._id;

      await ArticleLog.updateOne(
        { _id: archiveID },
        {
          $set: {
            archive: leftColumnId,
            archiveDate: new Date()
          }
        }
      ).exec();

      const archiveThroughRoute = async _id => {
        return await request(app)
          .post("/article/archive")
          .set("x-auth", logInToken)
          .send({ id: archiveID })
          .expect(400);
      };

      const {
        body: { archived, error }
      } = await archiveThroughRoute(archiveID);

      assert.equal(archived, false);
      assert.equal(error, "Article is already archived");
    });
  });
});
