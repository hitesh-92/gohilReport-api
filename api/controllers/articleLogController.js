
const { Types: {
    ObjectId
} } = require('mongoose');
const ArticleLog = require('../models/articleLog');
const Column = require('../models/column');

exports.getArchives = async (req, res) => {
    const data = { status: false }

    const columnId = await fetchColumnId();
    
    if( columnId == null ){
        data.error = {
            message: 'No archive column found'
        };

        return res.status(404).json(data);
    }

    const archives = await fetchArchives(columnId);
    
    if( archives == null ){
        data.error = {
            message: 'Error finding archived articles'
        };

        return res.status(400).json(data);
    };

    data.status = true;
    data.archives = archives;

    res.status(200).json(data);

    // -----

    async function fetchColumnId(){
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

    async function fetchArchives(columnId){
        let articles;

        try {
            
            articles = await ArticleLog.find(
                { 'column': columnId }
            )
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

exports.switchPositions = async (req, res) => {

    const {
        selected,
        moveTo
    } = req.body;

    const idsValid = validateId(selected.id) == validateId(moveTo.id);

    if(!idsValid){
        return res.status(400).json({ status: false });
    }

    const selectedRequest = switchRequest(selected);
    const moveToRequest = switchRequest(moveTo);

    const [
        { nModified: selectedSwitched },
        { nModified: moveToSwitched }
    ] = await Promise.all([selectedRequest, moveToRequest]);

    if (selectedSwitched && moveToSwitched){
        return res.status(200).json({status: true})
    }

    // -----

    function validateId(id){
        return ObjectId.isValid(id) == true;
    }

    async function switchRequest({
        id: _id,
        position
    }){
        return new Promise(resolve => {
            resolve(
                ArticleLog.updateOne(
                    { _id },
                    { $set: { position } }
                )
            );
        });
    };

};