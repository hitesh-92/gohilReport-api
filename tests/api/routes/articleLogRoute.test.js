const { app } = require("../../../app");

const {
  Types: { ObjectId }
} = require("mongoose");

const {
  articles,
  logInToken,
  columnIds: [leftColumnId]
} = require("../../seedData");

const ArticleLog = require("../../../api/models/articleLog");

describe("/article/:articleId GET", () => {
  it("find saved ArticleLog using _id", async () => {
    const article = articles[0];
    const id = article._id.toHexString();

    const {
      body: {
        found,
        article: { title }
      }
    } = await request(app)
      .get(`/article/${id}`)
      .expect(200);

    assert.strictEqual(found, true);
    assert.strictEqual(title, article.title);
  });

  it("Bad ID results in not found", async () => {
    const badID = "123456";

    const {
      body: { found }
    } = await request(app)
      .get(`/article/${badID}`)
      .expect(400);

    assert.strictEqual(found, null);
  });
});

describe("/article/ POST", () => {
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
      .then(({ body: { articleSaved } }) => {
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
      .then(({ body: { createdArticle: { _id } } }) => {
        ArticleLog.findById(_id).then(({ title, url }) => {
          assert.equal(title, data.title);
          assert.equal(url, data.url);
        });
      });
  });
});

describe.only("/article/ PATCH", () => {

  it("updates article title/url", () => {
    // const hex_id = articles[0]._id.toHexString();

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
      .then( ({ 
        body: { status }
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
      body: { status }
    } = await request(app)
      .patch('/article/')
      .set("x-auth", logInToken)
      .send(data)
      .expect(200)

    assert.equal(status, true)

    const {
      title
    } =  await ArticleLog
      .findOne({_id: data.id})
      .select('title')
      .exec()
    
    assert.equal(title, data.title)
  });

  it("rejects request with no title/url", async () => {

    const data = {
      id: new ObjectId()
    }

    const {
      body: { status, message }
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
        error: { message }
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

describe("/article/:articleId DELETE", () => {
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
  }); 
  
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
  });

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

describe("/article/archive/", () => {
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
  }); 

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
