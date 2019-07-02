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


describe("/article/ PATCH", () => {

  it("updates article title/url", async () => {

    const data = {
      id: articles[0]._id,
      title: "one uno eno noe",
      url: "http://wwww.oneoneone.com"
    };

    const {
      body: {
        status
      }
    } = await patch_requestArticleRoute(data, 200)

    assert.equal(status, true);
  });

  it("only updates title", async () => {

    const data = {
      id: articles[0]._id,
      title: 'updated Title'
    };

    const {
      body: {
        status
      }
    } = await patch_requestArticleRoute(data, 200);

    const {
      title
    } = await ArticleLog.findOne({
      _id: data.id
    }).lean().exec();

    assert.equal(status, true);

    assert.equal(title, data.title)
  });

  it('only updates article position', async () => {

    const article = articles[0];

    const sendData = {
      id: article._id,
      position: 2
    };

    const {
      body: {
        status
      }
    } = await patch_requestArticleRoute(sendData, 200);
    assert.equal(status, true);

    const updated = await ArticleLog.findOne({ '_id':article._id }).exec();
    assert.equal(updated.position, 2);

  });

  it("update article image link", async () => {

    const {
      _id,
      image
    } = articles[0];

    var updateData = {
      id: _id,
      image: 'www.newwww.com'
    };

    const {
      body: {
        status
      }
    } = await patch_requestArticleRoute(updateData, 200);

    const {
      image: updatedLink
    } = await ArticleLog.findById(_id).lean().exec();

    assert.equal(status, true);

    assert.equal(updatedLink, updateData.image);
  });

  it("rejects request with no title/url", async () => {

    const data = {
      id: new ObjectId()
    };

    const {
      body: {
        status,
        error
      }
    } = await patch_requestArticleRoute(data, 400);

    assert.equal(status, false);
    assert.equal(error, 'Invalid request');
  });

  it("rejects request with invalid article id", async () => {

    const data = {
      id: new ObjectId(),
      title: 'random Title'
    }

    const {
      body: {
        status,
        error: {
          message
        }
      }
    } = await patch_requestArticleRoute(data, 400);

    assert.equal(status, false)
    assert.equal(message, 'Unable find article with ID');
  });

});

describe("/article/removeimage", () => {

  it("removes link from exisitng article", async () => {

    const {
      _id
    } = articles[0];

    const {
      body: {
        status
      }
    } = await request(app)
      .patch('/article/removeimage')
      .set('x-auth', logInToken)
      .send({
        id: _id
      })
      .expect(200);

    assert.equal(status, true);

    const {
      image
    } = await ArticleLog.findById(_id).lean().exec();

    assert.equal(image, null);
  });

});

describe("/article/switch PATCH", () => {

  it("switch position two articles in column", async () => {

    const data = {
      selected: articles[0]._id,
      moveTo: articles[1]._id
    };

    const {
      body: {
        status
      }
    } = await patch_switch_requestArticleRoute(data, 200);

    assert.equal(status, true);

    const [
      new_firstArticle,
      new_secondArticle
    ] = await ArticleLog.find({
        '_id': {
          $in: [
            ObjectId(articles[1]._id),
            ObjectId(articles[0]._id)
          ]
        }
      })
      .select('_id title position')
      .sort({
        position: 1
      })
      .lean()
      .exec();

    assert.equal(new_firstArticle.title, articles[1].title);
    assert.equal(new_firstArticle.position, 1);

    assert.equal(new_secondArticle.title, articles[0].title);
    assert.equal(new_secondArticle.position, 2);

  });

  it("rejects articles from different columns", async () => {

    const data = {
      selected: articles[5]._id,
      moveTo: articles[0]._id
    };

    const {
      body: {
        status,
        error
      }
    } = await patch_switch_requestArticleRoute(data, 404);

    assert.equal(status, false);
    assert.equal(error, 'column');
  });

  it("rejects invalid if invalid id", async () => {
    const data = {
      selected: new ObjectId(),
      moveTo: articles[0]._id,
    };

    const {
      body: {
        status,
        error
      }
    } = await patch_switch_requestArticleRoute(data, 400);

    assert.equal(status, false);
    assert.equal(error, 'articleId');
  })

});

describe("/article/insert PATCH", () => {

  var extraArticles;

  beforeEach(async() => {
    extraArticles = await insertExtraArticles(leftColumnId);
  });

  it('insert article into higher position', async () => {
    // var extraArticles = await insertExtraArticles(leftColumnId);
    var articleToMove = extraArticles[5];

    const insertData = {
      id: articleToMove._id,
      position: 2
    };

    const {
      body: {
        inserted
      }
    } = await patch_insert_requestArticleRoute(insertData, 200);
    assert.equal(inserted, true);

    const [
      second, third, , , , , eigth
    ] = await ArticleLog.find({
        column: leftColumnId,
        position: {
          $gte: 2,
          $lte: 8
        }
      })
      .sort({
        position: 1
      })
      .select('title')
      .lean();

    assert.equal(second.title, articleToMove.title);
    assert.equal(third.title, articles[1].title);
    assert.equal(eigth.title, extraArticles[4].title);

  });

  it('insert article into lower position', async () => {

    var articleToMove = articles[1]; //2nd in left column

    const insertData = {
      id: articleToMove._id,
      position: 5
    };

    const {
      body: {
        inserted
      }
    } = await patch_insert_requestArticleRoute(insertData, 200);
    assert.equal(inserted, true);

    const [
      second, third, , fifth
    ] = await ArticleLog.find({
      column:leftColumnId,
      position: {
        $gte: 2,
        $lte: 5
      }
    })
    .sort({ position: 1 })
    .select('title position')
    .exec();

    assert.equal(second.title, extraArticles[0].title);
    assert.equal(second.position, 2);
    assert.equal(third.title, extraArticles[1].title);
    assert.equal(third.position, 3);
    assert.equal(fifth.title, articleToMove.title);
    assert.equal(fifth.position, 5);

  });

  it('insert article into position 1 higher', async () => {

    var articleToMove = extraArticles[0]; //position 3

    const insertData = {
      id: articleToMove._id,
      position: 2
    };

    const {
      body: {
        inserted
      }
    } = await patch_insert_requestArticleRoute(insertData, 200);
    assert.equal(inserted, true);

    const [
      second, third
    ] = await ArticleLog.find({
      column: leftColumnId,
      position: {
        $gte: 2,
        $lte: 3
      }
    })
    .sort({ position: 1 })
    .select('title position')
    .exec();

    assert.equal(second.title, articleToMove.title);
    assert.equal(second.position, 2);
    assert.equal(third.title, articles[1].title);
    assert.equal(third.position, 3);

  });

  it('rejects request with position out of range', async () => {

    const insertData = {
      id: articles[0]._id,
      position: 99
    };

    const {
      body: {
        error
      }
    } = await patch_insert_requestArticleRoute(insertData, 400);

    assert.equal(error, 'bad position');

  });

  it('rejects request invalid article', async () => {

    const insertData = {
      id: new ObjectId(),
      position: 2
    };

    const {
      body: {
        error
      }
    } = await patch_insert_requestArticleRoute(insertData, 400);

    assert.equal(error, 'Invalid Article');

  });

});

describe("/article/archive PATCH", () => {

  it("unarchives article", async () => {

    var article = articles[0];

    var data = {
      id: article._id
    };

    const {
      body: archivedResponse
    } = await requestToArchiveRoute('post', data, 200);

    const {
      body: unarchivedResponse
    } = await requestToArchiveRoute('patch', data, 200);

    var unarchivedArticle = await ArticleLog.findOne({
      _id: data.id
    }).lean().exec();

    assert.equal(archivedResponse.archived, true);

    assert.equal(unarchivedResponse.unarchived, true);

    assert.equal(unarchivedArticle.column.toString(), article.column.toString());
    assert.equal(unarchivedArticle.position, 2);
    assert.equal(unarchivedArticle.columnRef, null);
  });

});


async function patch_requestArticleRoute(sendData, expectedStatus) {
  return await request(app)
    .patch('/article/')
    .set("x-auth", logInToken)
    .send(sendData)
    .expect(expectedStatus)
};

async function patch_switch_requestArticleRoute(sendData, expectedStatus) {
  return await request(app)
    .patch('/article/switch')
    .set("x-auth", logInToken)
    .send(sendData)
    .expect(expectedStatus)
};

async function patch_insert_requestArticleRoute(sendData, expectedStatus) {
  return await request(app)
    .patch('/article/insertposition')
    .set("x-auth", logInToken)
    .send(sendData)
    .expect(expectedStatus)
}

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
