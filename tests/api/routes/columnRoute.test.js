const { app } = require('../../../app')

const mongoose = require('mongoose')
const { Types: { ObjectId } } = mongoose

const {
    columnIds: [leftColumnId],
    logInToken,
    linkArticlesToColumn,
    articles
} = require('../../seedData')

const Column = require('../../../api/models/column')
const ArticleLog = require('../../../api/models/articleLog')

describe('column/ Routes', () => {

    describe('GET /', () => {

        it('return all column with articles', () => {
            return request(app)
                .get('/column/')
                .expect(200)
                .then(({
                    body: { center, left, right }
                }) => {
                    assert.equal(left.length, 2)
                    assert.equal(center.length, 2)
                    assert.equal(right.length, 2)
                })
        })

    })

    describe('GET /:column', () => {

        it('find column and return articles', () => {
            return request(app)
                .get('/column/left')
                .expect(200)
                .then(({
                    body: {
                        columnData: { _id },
                        articles,
                        error
                    }
                }) => {
                    assert.equal(error, false)
                    assert.equal(_id, leftColumnId)
                    assert.equal(articles.length, 2)
                })
        })

        it("not find invalid column", () => {
            return request(app)
                .get('/column/badColumn')
                .expect(400)
                .then(({
                    body: {
                        columnData,
                        message,
                        error
                    }
                }) => {
                    assert.equal(columnData, null)
                    assert.equal(message, 'Column not found')
                    assert.equal(error, true)
                })
        })

    })

    describe('POST /', () => {

        it('save new column and find it', () => {

            const postColumnData = {
                title: 'testTitlee'
            }

            return request(app)
                .post('/column')
                .set('x-auth', logInToken)
                .set('Accept', 'application/json')
                .send(postColumnData)
                .expect(200)
                .then(async ({
                    body: {
                        column,
                        title,
                        message,
                        saved
                    }
                }) => {

                    const id = ObjectId.createFromHexString(column._id)

                    assert.equal(title, postColumnData.title)
                    assert.equal(message, 'success')
                    assert.equal(saved, true)

                    const { title: savedTitle } = await Column.findById(id)
                        .select('title')
                        .exec()

                    assert.equal(savedTitle, postColumnData.title)
                })

        })

        it('reject request with bad articleId', () => {

            const postColumnData = {
                title: ''
            }

            return request(app)
                .post('/column')
                .set('x-auth', logInToken)
                .set('Accept', 'application/json')
                .send(postColumnData)
                .expect(400)
                .then(({
                    body: {
                        error,
                        saved
                    }
                }) => {
                    assert.equal(saved, false)
                    assert.equal(error, 'Invalid title')
                })
        })

    })

    describe('PATCH /', () => {

        it('updates single column document', async () => {

            const sendData = {
                id: leftColumnId,
                title: 'updateMeee'
            }

            const {
                body: { column: {
                    nModified
                } }
            } = await request(app)
                .patch('/column/')
                .set('x-auth', logInToken)
                .set('Accept', 'application/json')
                .send(sendData)
                .expect(200)

            assert.equal(nModified, 1)

            const {
                title,
                createdAt,
                updatedAt
            } = await Column.findOne({
                _id: leftColumnId
            })
                .select('title createdAt updatedAt')
                .exec()

            assert.equal(title, sendData.title)
            assert.notEqual(createdAt, updatedAt)
        });

        it('reject invalid column id', async () => {

            const sendData = {
                id: '123456789',
                title: 'newTitle'
            }

            const {
                body: { error }
            } = await request(app)
                .patch('/column/')
                .set('x-auth', logInToken)
                .set('Accept', 'application/json')
                .send(sendData)
                .expect(400)

            assert.equal(error, 'Invalid id')
        })

        it('reject if no column found', async () => {

            const sendData = {
                id: new ObjectId()
            }

            const {
                body: { error }
            } = await request(app)
                .patch('/column/')
                .set('x-auth', logInToken)
                .set('Accept', 'application/json')
                .send(sendData)
                .expect(400)

            assert.equal(error, 'No column with given id found')
        })


    })

    describe('DELETE /:column', () => {

        it('delete single column', async () => {

            const {
                body: { deleted, message }
            } = await request(app)
                .delete('/column/right')
                .set('x-auth', logInToken)
                .expect(200)

            assert.equal(message, 'success')
            assert.equal(deleted, true)
        })

        it('reject wrong column', async () => {

            const {
                body: { deleted, message }
            } = await request(app)
                .delete('/column/noColumn')
                .set('x-auth', logInToken)
                .expect(400)

            assert.equal(message, 'Invalid Column Provided')
            assert.equal(deleted, false)
        })
    })

});

