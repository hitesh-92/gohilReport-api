const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')

const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

const ObjectId = require('mongoose').Types.ObjectId

// TypeError: Converting circular structure to JSON
// bad bad bad 
class Data {
    constructor() {
        this.columnData;
        this.articles;
        this.message;
        this.requestedColumn;
    }

    addRequestedColumn(title){
        this.requestedColumn = title;
    }

    addColumnData(data){
        this.columnData = data
    }

    getIdsToFind(){
        const idsToFind = new Array
        const ids = this.columnData.articleIDs
        ids.forEach(id => {
            idsToFind.push({_id: id})
        })
        return idsToFind
    }

    addArticles(data){
        this.articles = data
    }

    addMessage(text){
        this.message =  text
    }

    addError(err){
        this.error = err
    }

    buildResponse(){
        const data = {
            columnData: this.columnData || null,
            time: new Date().getTime(),
            message: this.message || 'success',
            requestedColumn: this.requestedColumn,
            articles: this.articles,
            error: this.error || false
        }
        return data
    }

    
}

Data.prototype.toString = function DataToString() {
    return `${this.columnData}`
}

/*
    GET /
*/

// make this return object with data for all 3 columns
router.get('/', Authenticate, (req,res) => {

    const response = {
        message: 'Please select column'
    }

    res.status(200).json(response)
});

// return data for a single column (useful for alert section)
// set up check to ony allow 'right,middle,left,alert' columns
router.get('/:column', Authenticate, (req, res) => {


    let title = req.params.column

    let data = new Data()

    Column.findOne({title})
    .then(singleColumn => {

        data.addRequestedColumn(title)

        data.addColumnData(singleColumn)

        if(singleColumn == null){
            data.addMessage('Column not found')
            return
        }
        
        const queryIDs = data.getIdsToFind()
        return queryIDs
    })
    .then(ids => ArticleLog.find({_id: {$in: ids} }) )
    .then(articles => {

        if(articles) data.addArticles(articles)

        let status;

        if(data.columnData == null){
            data.addError(true)
            status = 400
        } else {
            status = 200
        }

        const response = data.buildResponse()

        res.status(status).json(response)

    })
    .catch(e => {
        data.addError(true)
        const response = data.buildResponse()
        res.status(500).json(response)
    })




})//GET /:column

module.exports = router;