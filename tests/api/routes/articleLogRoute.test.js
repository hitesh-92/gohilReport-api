const {
  app
} = require("../../../app");

const {
  Types: {
    ObjectId
  }
} = require("mongoose");

const {
  articles,
  logInToken,
  columnIds: [leftColumnId, , , archiveColumnId]
} = require("../../seedData");

const ArticleLog = require("../../../api/models/articleLog");

describe("/article/ GET", () => {
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
        createdArticle: { _id }
      }
    } = await post_requestArticleRoute(data, 201);

    const savedArticle = await ArticleLog.findOne({ _id }).lean().exec();

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
    .sort({ position: 1 })
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
    } = await ArticleLog.findOne({ _id: savedArticleId }).select('title url position').exec();

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
    } =  await post_requestArticleRoute(data, 201);

    const {
      title,
      position
    } = await ArticleLog.findOne({ _id: savedArticleId }).select('position title').exec();

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

});

describe("/article/ PATCH", () => {

  it("updates article title/url", async () => {

    const data = {
      id: articles[0]._id,
      title: "one uno eno noe",
      url: "http://wwww.oneoneone.com"
    };

    const {
      body: { status }
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
    } = await ArticleLog.findOne({ _id: data.id }).lean().exec();

    assert.equal(status, true);

    assert.equal(title, data.title)
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

  it("rejects request with no title/url", async () => {

    const data = {
      id: new ObjectId()
    };

    const {
      body: {
        status,
        message
      }
    } = await patch_requestArticleRoute(data, 400);

    assert.equal(status, false);
    assert.equal(message, 'No title or url provided');
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

describe("/article/ DELETE", () => {

  it("delete exisitng article", async () => {

    const data = { id: articles[1]._id };

    const {
      body: {
        deleted
      }
    } = await delete_requestArticleRoute(data, 200);

    assert.equal(deleted, true)
  });

  it("reject invaid id", async () => {

    const data = { id: "!000000f7cad342ac046AAAA" };

    const {
      body: {
        deleted,
        error
      }
    } = await delete_requestArticleRoute(data, 404);

    assert.equal(deleted, false);
    assert.equal(error, "Bad article id");
  });

  it("not find article with non-existing id", async () => {

    const data = { id: new ObjectId() };

    const {
      body: {
        deleted,
        error
      }
    } = await delete_requestArticleRoute(data, 404);

    assert.equal(deleted, false);
    assert.equal(error, "Invalid request to delete");
  });
});

describe("/article/archive/", () => {

  it("POST null position propery and re-adjust positions", async () => {

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
          url: 'www.sdfj.com',
          column: leftColumnId,
          position: 3
        },
        {
          _id: new ObjectId(),
          title: '77WWo0',
          url: 'www.sdfj.com',
          column: leftColumnId,
          position: 4
        }
      ])
    }

  });

  it("POST archive existing article", async () => {
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

  it("POST not archive existing archive", async () => {

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

  describe("PATCH", () => {

    it("unarchives article", async () => {

      var article = articles[0];

      var data = { id: article._id };

      const {
        body: archivedResponse
      } = await requestToArchiveRoute('post', data, 200);

      const {
        body: unarchivedResponse
      } = await requestToArchiveRoute('patch', data, 200);

      var unarchivedArticle = await ArticleLog.findOne({ _id: data.id }).lean().exec();

      assert.equal(archivedResponse.archived, true);

      assert.equal(unarchivedResponse.unarchived, true);

      assert.equal(unarchivedArticle.column.toString(), article.column.toString());
      assert.equal(unarchivedArticle.position, 2);
      assert.equal(unarchivedArticle.columnRef, null);
    });

  });

});

// -----

async function get_requestArticleRoute(id, expectStatus) {
  return await request(app)
    .get(`/article/${id}`)
    .set("x-auth", logInToken)
    .expect(expectStatus);
};

async function post_requestArticleRoute(sendData, expectedStatus){
  return await request(app)
  .post('/article/')
  .set("x-auth", logInToken)
  .send(sendData)
  .expect(expectedStatus)
};

async function patch_requestArticleRoute(sendData, expectedStatus){
  return await request(app)
  .patch('/article/')
  .set("x-auth", logInToken)
  .send(sendData)
  .expect(expectedStatus)
};

async function patch_switch_requestArticleRoute(sendData, expectedStatus){
  return await request(app)
  .patch('/article/switch')
  .set("x-auth", logInToken)
  .send(sendData)
  .expect(expectedStatus)
};

async function delete_requestArticleRoute(sendData, expectedStatus){
  return await request(app)
  .delete('/article/')
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
  }
  else if (type === 'patch') {
    return await request(app)
      .patch(url + 'unarchive')
      .set("x-auth", logInToken)
      .send(sendData)
      .expect(expectStatus);
  }

};
