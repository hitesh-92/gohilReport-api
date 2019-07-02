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
  columnIds: [leftColumnId, , , archiveColumnId],
  insertExtraArticles
} = require("../../seedData");

const ArticleLog = require("../../../api/models/articleLog");

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

describe("/article/archive/", () => {

  describe("POST", () => {

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

  describe("PATCH", () => {

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

});

// -----

// it.skip('TESTING',async () => {
//   const {body} = await requestToArchiveRoute(articles[0]._id, 200);
//   console.log(body)
// })

async function get_requestArticleRoute(id, expectStatus) {
  return await request(app)
    .get(`/article/${id}`)
    .set("x-auth", logInToken)
    .expect(expectStatus);
};

async function post_requestArticleRoute(sendData, expectedStatus) {
  return await request(app)
    .post('/article/')
    .set("x-auth", logInToken)
    .send(sendData)
    .expect(expectedStatus)
};

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

async function delete_requestArticleRoute(id, expectedStatus) {
  return await request(app)
    .delete(`/article/${id}`)
    .set("x-auth", logInToken)
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
