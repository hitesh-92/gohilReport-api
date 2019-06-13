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
  columnIds: [leftColumnId]
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
      .get(`/article/single/${id}`)
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
      .get(`/article/single/${badId}`)
      .expect(400)

    assert.equal(found, null)
    assert.equal(message, "Invalid Article ID provided")
  });

  it("not find article", async () => {

    const randomId = new ObjectId();

    const {
      body: {
        found,
        message
      }
    } = await request(app)
      .get(`/article/single/${randomId}`)
      .expect(404)

    assert.equal(found, false)
    assert.equal(message, 'No Article found with given requestId')
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
        createdArticle: { _id: articleId }
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

    assert.equal(title , articleData.title);
    assert.equal(url , articleData.url);
    assert.equal(image , articleData.image);
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
      selected: {
        id: articles[0]._id,
        position: 2
      },
      moveTo: {
        id: articles[1]._id,
        position: 1
      }
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
      firstArticle,
      editedArticle
    ] = await ArticleLog.find({
        '_id': {
          $in: [
            ObjectId(articles[0]._id),
            ObjectId(articles[1]._id)
          ]
        }
      })
      .select('_id title position')
      .sort({
        position: 1
      })
      .lean()
      .exec();

    assert.equal(firstArticle.title, articles[1].title);
    assert.equal(firstArticle.position, 1);
    assert.equal(editedArticle.title, articles[0].title);
    assert.equal(editedArticle.position, 2);

  });

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

  it("GET get all archived articles", async () => {

    const {
      body: {
        archives,
        status
      }
    } = await request(app)
      .get('/article/archive')
      .expect(200)

    assert.equal(status, true);
    assert.equal(archives.length, 2);
  });

  it("POST null position propery and re-adjust positions", async () => {

    //extra articles to test with
    await ArticleLog.create({
      _id: new ObjectId(),
      title: '0onE3',
      url: 'www.sdfj.com',
      column: leftColumnId,
      position: 3
    }, {
      _id: new ObjectId(),
      title: '77WWo0',
      url: 'www.sdfj.com',
      column: leftColumnId,
      position: 4
    }, );

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
      .sort({position: 1})
      .lean()
      .exec();

    assert.equal(column[0].title, articles[1].title)
    assert.equal(column[1].title, '0onE3')
    assert.equal(column[2].title, '77WWo0')
  });

  it("POST archive existing article", async () => {
    const archiveID = articles[2]._id;

    const {
      body: {
        archived,
        message
      }
    } = await request(app)
      .post("/article/archive")
      .set("x-auth", logInToken)
      .send({
        id: archiveID
      })
      .expect(200);

    assert.equal(message, "Article archived");
    assert.equal(archived, true);

    const {
      archive,
      archiveDate
    } = await ArticleLog.findOne({
        _id: archiveID
      })
      .select("archive archiveDate")
      .exec();

    assert.equal(ObjectId.isValid(archive), true);
    assert.equal(typeof archiveDate, "object");
  });

  it("POST not archive existing archive", async () => {
    const archiveID = articles[6]._id;

    await ArticleLog.updateOne({
      _id: archiveID
    }, {
      $set: {
        archive: leftColumnId,
        archiveDate: new Date()
      }
    }).exec();

    const archiveThroughRoute = async _id => {
      return await request(app)
        .post("/article/archive")
        .set("x-auth", logInToken)
        .send({
          id: archiveID
        })
        .expect(400);
    };

    const {
      body: {
        archived,
        error
      }
    } = await archiveThroughRoute(archiveID);

    assert.equal(archived, false);
    assert.equal(error, "Article is already archived");
  });
});
