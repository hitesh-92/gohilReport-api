const {
    Types: { ObjectId }
} = require('mongoose');

module.exports = {
  getArchives,
  archiveArticle
}

async function getArchives(req, res, ArticleLog, Column){
    const data = {
        status: false
    }

    const columnId = await fetchColumnId();

    if (columnId == null) {
        data.error = {
            message: 'No archive column found'
        };

        return res.status(404).json(data);
    }

    const archives = await fetchArchives(columnId);

    if (archives == null) {
        data.error = {
            message: 'Error finding archived articles'
        };

        return res.status(400).json(data);
    };

    data.status = true;
    data.archives = archives;

    res.status(200).json(data);

    // -----

    async function fetchColumnId() {
        let columnId;

        try {
            const {
                _id
            } = await Column.findOne({
                    title: 'archive'
                })
                .select('_id')
                .lean()
                .exec();
            columnId = _id;
        } catch (error) {
            columnId = null;
        } finally {
            return columnId;
        }

    };

    async function fetchArchives(columnId) {
        let articles;

        try {

            articles = await ArticleLog.find({
                    'column': columnId
                })
                .select('_id title url column createdAt')
                .lean()
                .exec();

        } catch (error) {
            articles = null;
        } finally {
            return articles;
        }

    };
};

async function archiveArticle(req, res, ArticleLog, Column){

    let data = {
        archived: false
    };

    const {
        id: articleId
    } = req.body;

    if (!(ObjectId.isValid(articleId))) {
        data.error = 'Invalid id';
        return res.status(400).send(data);
    }

    const [article, columnId] = await fetchData(articleId);

    if (
        article == null &&
        columnId == null
    ) {
        data.error = 'Error finding information with data provided';
        return res.status(404).json(data);
    } else if (article.archive != undefined) {
        data.error = 'Article is already archived';
        return res.status(400).json(data);
    }

    const {
        nModified: archived
    } = await archiveArticle(article._id, columnId);

    if (archived == null) {
        data.error = 'Error archiving article';
        return res.status(500).json(data);
    }

    const positionRemoved = await ArticleLog.removePosition(article._id)

    if (positionRemoved == null) {
        data.error = 'Error removing position from article'
        return res.status(500).json(data);
    }

    data.archived = true;
    data.message = 'Article archived';

    return res.status(200).json(data);

    // -----

    async function fetchData(articleId) {

        const fetchArticle = new Promise(resolve => {
            resolve(
                ArticleLog.findOne({
                    '_id': articleId
                })
                .select('_id archive')
                .lean()
                .exec()
            )
        });

        const fetchArchiveColumn = new Promise(resolve => {
            resolve(
                Column.findOne({
                    title: 'archive'
                })
                .select('_id')
                .lean()
                .exec()
            )
        });

        let data;

        try {
            data = await Promise.all([fetchArticle, fetchArchiveColumn]);
        } catch (error) {
            data = [null, null];
        } finally {
            return data;
        }
    };

    async function archiveArticle(articleId, columnId) {
        let archived;

        try {
            archived = await ArticleLog.updateOne({
                _id: articleId
            }, {
                $set: {
                    archive: columnId,
                    archiveDate: new Date()
                }
            }).exec();
        } catch (error) {
            archived = null;
        } finally {
            return archived;
        }
    }

};
