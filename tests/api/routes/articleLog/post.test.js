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

describe("/article/ POST", () => {

  it("create and save new article", async () => {
    const articleData = {
      title: "return201",
      url: "www.201.com",
      image: "www.image-link.com",
      position: 2,
      column: leftColumnId
    };

    const {
      body: {
        articleSaved,
        createdArticle: {
          _id: articleId
        }
      }
    } = await post_requestArticleRoute(articleData, 201);

    const {
      title,
      url,
      image
    } = await ArticleLog.findById(articleId).lean().exec();

    assert.equal(articleSaved, true);

    assert.equal(title, articleData.title);
    assert.equal(url, articleData.url);
    assert.equal(image, articleData.image);
  });

  it("does not saved article with invalid data", async () => {
    const data = {
      title: '',
      url: '',
      column: leftColumnId
    };

    const {
      body: {
        articleSaved
      }
    } = await post_requestArticleRoute(data, 400);

    assert.equal(articleSaved, false);
  });

  it("save new Article, find in db using response _id", async () => {

    // ARTICLE POSITION AFTER SAVING = 0

    const data = {
      title: "return 2019",
      url: "www.2019.com",
      column: leftColumnId
    };

    const {
      body: {
        createdArticle: {
          _id
        }
      }
    } = await post_requestArticleRoute(data, 201);

    const savedArticle = await ArticleLog.findOne({
      _id
    }).lean().exec();

    assert.equal(savedArticle.title, data.title);
    assert.equal(savedArticle.position, 3);
    assert.equal(savedArticle._id.toString(), _id.toString());
  });

  it("adds articles to first position in column and edits others", async () => {

    var data = {
      title: "articelLog title",
      url: "www.articlee.com",
      image: 'www.myimage.com',
      column: leftColumnId,
      position: 1
    };

    const {
      body: {
        createdArticle: {
          _id: newArticleId
        }
      }
    } = await post_requestArticleRoute(data, 201);

    const [
      first, second, third
    ] = await ArticleLog.find({
        column: leftColumnId
      })
      .select('title position')
      .sort({
        position: 1
      })
      .lean().exec();

    assert.equal(first.title, data.title);
    assert.equal(first.position, 1);

    assert.equal(second.title, articles[0].title);
    assert.equal(second.position, 2);

    assert.equal(third.title, articles[1].title);
    assert.equal(third.position, 3);
  });

  it("invalid position, sets article to last in column", async () => {

    const data = {
      title: 'somerandomTitle',
      url: 'www.sometest.co',
      column: leftColumnId,
      position: 10
    }

    const {
      body: {
        createdArticle: {
          _id: savedArticleId
        }
      }
    } = await post_requestArticleRoute(data, 201);

    const {
      title,
      url,
      position
    } = await ArticleLog.findOne({
      _id: savedArticleId
    }).select('title url position').exec();

    assert.equal(title, data.title);
    assert.equal(url, data.url);
    assert.equal(position, 3);
  });

  it("no position given defaults to last position in column", async () => {

    const data = {
      title: 'put me last',
      url: 'www.putmelast.com',
      image: 'putmelastimgage.com',
      column: leftColumnId
    };

    const {
      body: {
        createdArticle: {
          _id: savedArticleId
        }
      }
    } = await post_requestArticleRoute(data, 201);

    const {
      title,
      position
    } = await ArticleLog.findOne({
      _id: savedArticleId
    }).select('position title').exec();

    assert.equal(title, data.title);
    assert.equal(position, 3);
  });

  it("creates new article without image url", async () => {

    const data = {
      title: 'asdasdasd',
      url: 'adasdasd',
      column: leftColumnId,
      position: 1
    }

    const {
      body: {
        articleSaved
      }
    } = await post_requestArticleRoute(data, 201);

    assert.equal(articleSaved, true);
  });

  it('reject creating article in archive column', async () => {

    const articleData = {
      title: 'failMeTooo',
      url: 'www.fail.com',
      image: 'www.tonotsave.com',
      position: 2,
      column: archiveColumnId
    };

    const {
      body: {
        error
      }
    } = await post_requestArticleRoute(articleData, 400);

    assert.equal(error, 'Invalid Column');
  });

  it('rejects request if article position is not a valid number', async () => {

    const sendData = {
      position: 'abc',
      tite: 'thisShouldReject',
      url: 'www.wherhwerhwerc.com',
      column: leftColumnId,
      image: 'www.myimage.com'
    };

    const {
      body: {
        articleSaved
      }
    } = await post_requestArticleRoute(sendData, 400);

    assert.equal(articleSaved, false);

  });

});

describe("/article/archive POST", () => {

  it("null position propery and re-adjust positions", async () => {

    await saveAdditionalArticles();

    const {
      body: {
        archived
      }
    } = await requestToArchiveRoute('post', {
      id: articles[0]._id
    }, 200);

    assert.equal(archived, true);

    const column = await ArticleLog.find({
        'column': leftColumnId,
        position: {
          $gte: 1
        }
      })
      .select('position title')
      .sort({
        position: 1
      })
      .lean()
      .exec();

    assert.equal(column[0].title, articles[1].title);
    assert.equal(column[1].title, '0onE3');
    assert.equal(column[2].title, '77WWo0');

    // -----

    async function saveAdditionalArticles() {
      await ArticleLog.insertMany([{
          _id: new ObjectId(),
          title: '0onE3',
          url: 'www.zxcvbn.com',
          column: leftColumnId,
          position: 3
        },
        {
          _id: new ObjectId(),
          title: '77WWo0',
          url: 'www.asdfgh.com',
          column: leftColumnId,
          position: 4
        }
      ]);
    };

  });

  it("archive existing article", async () => {
    const article = articles[2];

    const {
      body: {
        archived,
        message
      }
    } = await requestToArchiveRoute('post', {
      id: article._id
    }, 200);

    assert.equal(message, "Article archived");
    assert.equal(archived, true);

    const archivedArticle = await ArticleLog.findOne({
      _id: article._id
    }).exec();

    assert.equal(archivedArticle.position, null)
    assert.equal(archivedArticle.column.toString(), archiveColumnId.toString())
    assert.equal(archivedArticle.columnRef.toString(), article.column.toString())
  });

  it("not archive existing archive", async () => {

    // archiveColumnId
    const {
      _id: archivedArticleId
    } = articles[6];

    const {
      body: {
        archived,
        error
      }
    } = await requestToArchiveRoute('post', {
      id: archivedArticleId
    }, 400);

    assert.equal(archived, false);
    assert.equal(error, "Article is already archived");

  });

});

async function post_requestArticleRoute(sendData, expectedStatus) {
  return await request(app)
    .post('/article/')
    .set("x-auth", logInToken)
    .send(sendData)
    .expect(expectedStatus)
};

async function requestToArchiveRoute(type, sendData, expectStatus) {
  const url = '/article/archive/';

  if (type === 'post') {
    return await request(app)
      .post(url)
      .set("x-auth", logInToken)
      .send(sendData)
      .expect(expectStatus);
  } else if (type === 'patch') {
    return await request(app)
      .patch(url + 'unarchive')
      .set("x-auth", logInToken)
      .send(sendData)
      .expect(expectStatus);
  }

};
