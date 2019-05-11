const ArticleLog = require('../models/articleLog');

exports.patch = async (req, res) => {
    let data = { status: false };

    const { 
        title = null,
        url = null,
        id = null
    } = req.body;

    if( 
        title == null &&
        url == null
    ){
        data.message = 'No title or url provided';
        return res.status(400).json(data)
    };

    const article = await fetchArticle(id);

    if( article == null ){
        data.error = {
            message: 'Unable find article with ID'
        }
        return res.status(400).json(data)
    };

    const { 
        nModified: patched = null
    } = await updateArticle(id, title, url);

    let status = 400;

    if( patched ) {
        data.status = true;
        status = 200;
    } else {
        data.error = {
            message: 'Unsuccessful update'
        }
    };

    res.status(status).json(data);

    // -----

    async function fetchArticle(_id){
        let article;

        try {
            article = await ArticleLog.findOne({
                _id
            })
                .select('_id column')
                .lean()
                .exec();
        } catch (error) {
            article = null
        } finally {
            return article
        }
    };

    async function updateArticle(_id, title, url) {
        let body = {};

        if (title) body.title = title;
        if (url) body.url = url;

        return await ArticleLog.updateOne({
            _id
        }, {
            $set: body
        });
    };

};
