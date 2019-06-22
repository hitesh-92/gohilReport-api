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

    const id = article.id;

    const {
      body: {
        found,
        article: {
          title
        }
      }
    } = await request(app)
      .get(`/article/${id}`)
      .expect(200)

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
    } = await request(app)
      .get(`/article/${badId}`)
      .expect(400)

    assert.equal(found, false)
    assert.equal(message, "Invalid Article ID provided")
  });

  it("not find article", async () => {

    const randomId = new ObjectId();

    const {
      // body
      body: {
        found,
        message
      }
    } = await request(app)
      .get(`/article/${randomId}`)
      .expect(404);

    // console.log(body)

    assert.equal(found, false)
    assert.equal(message, 'Invalid Article')
  });

  it("respond with article and column", async () => {

    const id = articles[0]._id.toHexString();

    const {
      body: {
        article,
        found,
        column
      }
    } = await request(app)
      .get(`/article/${id}`)
      .set('x-auth', logInToken)
      .expect(200);

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
    } = await request(app)
      .post('/article/')
      .set('x-auth', logInToken)
      .send(articleData)
      .expect(201);

    assert.equal(articleSaved, true);

    const {
      title,
      url,
      image
    } = await ArticleLog.findById(articleId).lean().exec();

    assert.equal(title, articleData.title);
    assert.equal(url, articleData.url);
    assert.equal(image, articleData.image);
  });

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
      .then(({
        body: {
          articleSaved
        }
      }) => {
        assert.equal(articleSaved, false);
      });
  });

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
      .then(({
        body: {
          createdArticle: {
            _id
          }
        }
      }) => {
        ArticleLog.findById(_id).then(({
          title,
          url
        }) => {
          assert.equal(title, data.title);
          assert.equal(url, data.url);
        });
      });
  });

  it("adds articles and edits positions", async () => {

    var article = new ArticleLog({
      _id: new ObjectId(),
      title: 'some new title',
      url: 'www.posittioning.com',
      column: leftColumnId,
      position: 3
    });

    await article.save();

    const {
      position
    } = await ArticleLog.findOne({
        _id: article._id
      })
      .select('position')
      .lean()
      .exec();

    assert.equal(position, article.position);
  })

  it("adds articles to first position in column and edits others", async () => {

    var data = {
      title: "articelLog title",
      url: "www.articlee.com",
      column: leftColumnId,
      position: 1
    };

    const {
      body: {
        createdArticle: {
          _id: newArticleId
        }
      }
    } = await request(app)
      .post('/article/')
      .set('x-auth', logInToken)
      .send(data)
      .expect(201)

    const ids = [newArticleId, articles[0]._id, articles[1]._id]

    const [
      newArticle,
      oldFirstArticle,
      oldSecondArticle
    ] = await ArticleLog
      .find({
        '_id': {
          $in: ids
        }
      })
      .select('_id position title')
      .sort({
        position: 1
      })
      .lean()
      .exec();

    assert.equal(newArticle.position, 1);
    assert.equal(newArticle.title, data.title);
    assert.equal(oldFirstArticle.position, 2);
    assert.equal(oldFirstArticle.title, articles[0].title);
    assert.equal(oldSecondArticle.position, 3);
    assert.equal(oldSecondArticle.title, articles[1].title);
  });

  it("invalid position, sets article to last in column", async () => {

    const data = {
      _id: new ObjectId(),
      title: 'somerandomTitle',
      url: 'www.sometest.co',
      column: leftColumnId,
      position: 10
    }

    const {
      body: {
        createdArticle: {
          _id
        }
      }
    } = await request(app)
      .post('/article/')
      .set('x-auth', logInToken)
      .send(data)
      .expect(201)


    const {
      position
    } = await ArticleLog.findOne({
        _id
      })
      .select('position')
      .lean()
      .exec();

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
    } = await request(app)
      .post('/article/')
      .set('x-auth', logInToken)
      .send(data)
      .expect(201);

    assert.equal(articleSaved, true);
  });

});

describe("/article/ PATCH", () => {

  it("updates article title/url", () => {

    const data = {
      id: articles[0]._id,
      title: "one uno eno noe",
      url: "http://wwww.oneoneone.com"
    };

    return request(app)
      .patch('/article/')
      .set("x-auth", logInToken)
      .send(data)
      .expect(200)
      .then(({
        body: {
          status
        }
      }) => {
        assert.equal(status, true);
      });
  });

  it("only updates title", async () => {

    const data = {
      id: articles[0]._id,
      title: 'updated Title'
    }

    const {
      body: {
        status
      }
    } = await request(app)
      .patch('/article/')
      .set("x-auth", logInToken)
      .send(data)
      .expect(200)

    assert.equal(status, true)

    const {
      title
    } = await ArticleLog
      .findOne({
        _id: data.id
      })
      .select('title')
      .exec()

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
    }

    const {
      body: {
        status
      }
    } = await request(app)
      .patch('/article/')
      .set('x-auth', logInToken)
      .send(updateData)
      .expect(200);

    assert.equal(status, true);

    const {
      image: updatedLink
    } = await ArticleLog
      .findById(_id)
      .lean()
      .exec();

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
    }

    const {
      body: {
        status,
        message
      }
    } = await request(app)
      .patch('/article/')
      .set("x-auth", logInToken)
      .send(data)
      .expect(400)

    assert.equal(status, false)
    assert.equal(message, 'No title or url provided')
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
    } = await request(app)
      .patch('/article/')
      .set("x-auth", logInToken)
      .send(data)
      .expect(400)

    assert.equal(status, false)
    assert.equal(message, 'Unable find article with ID');
  })

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
    } = await request(app)
      .patch('/article/switch')
      .set('x-auth', logInToken)
      .send(data)
      .expect(200);

    assert.equal(status, true)

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
    } = await request(app)
      .patch('/article/switch')
      .set('x-auth', logInToken)
      .send(data)
      .expect(404);

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
    } = await request(app)
      .patch('/article/switch')
      .set('x-auth', logInToken)
      .send(data)
      .expect(400);

    assert.equal(status, false);
    assert.equal(error, 'articleId');
  })

});

describe("/article/ DELETE", () => {

  it("delete exisitng article", async () => {

    const {
      body: {
        deleted
      }
    } = await request(app)
      .delete('/article/')
      .set("x-auth", logInToken)
      .send({
        id: articles[1]._id
      })
      .expect(200)

    assert.equal(deleted, true)
  });

  it("reject invaid id", async () => {

    const id = "!000000f7cad342ac046AAAA";

    const {
      body: {
        deleted,
        error
      }
    } = await request(app)
      .delete("/article/")
      .set("x-auth", logInToken)
      .send({
        id
      })
      .expect(404)

    assert.equal(deleted, false);
    assert.equal(error, "Bad article id");
  });

  it("not find article with non-existing id", async () => {

    const {
      body: {
        deleted,
        error
      }
    } = await request(app)
      .delete("/article/")
      .set("x-auth", logInToken)
      .send({
        id: new ObjectId()
      })
      .expect(404)

    assert.equal(deleted, false);
    assert.equal(error, "Invalid request to delete");
  });
});

describe("/article/archive/", () => {

  it("POST null position propery and re-adjust positions", async () => {

    await saveAdditionalArticles();
    // console.log('\nTEST COL ID ==> ', leftColumnId)

    const data = {
      id: articles[0]._id
    };

    const {
      body: {
        archived
      }
    } = await request(app)
      .post('/article/archive')
      .set('x-auth', logInToken)
      .send(data)
      .expect(200);

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
    } = await request(app)
      .post("/article/archive")
      .set("x-auth", logInToken)
      .send({
        id: article._id
      })
      .expect(200);

    assert.equal(message, "Article archived");
    assert.equal(archived, true);

    const archivedArticle = await ArticleLog.findOne({
      _id: article._id
    }).exec();

    assert.equal(archivedArticle.position, null)
    assert.equal(archivedArticle.column.toString(), archiveColumnId.toString())
    assert.equal(archivedArticle.columnRef, article.column)
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
    } = await request(app)
      .post("/article/archive")
      .set("x-auth", logInToken)
      .send({
        id: archivedArticleId
      })
      .expect(400);

    assert.equal(archived, false);
    assert.equal(error, "Article is already archived");

  });

});