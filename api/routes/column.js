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

    buildGetColumnResponse(){
        return {
            columnData: this.columnData || null,
            time: new Date().getTime(),
            message: this.message || 'success',
            requestedColumn: this.requestedColumn,
            articles: this.articles,
            error: this.error || false
        }
    }

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

/*
    GET /:column
*/
// return data for a single column (useful for alert section)
// set up check to ony allow 'right,middle,left,alert' columns
router.get('/:column', Authenticate, (req, res) => {

    let title = req.params.column

    let data = new Data()

    Column.findOne({title})
    .then(singleColumn => {

        //add to response data
        data.addRequestedColumn(title)
        data.addColumnData(singleColumn)

        //return if no column found
        if(singleColumn == null) return
        
        //return articles ids to query db
        const queryIDs = data.getIdsToFind()
        return queryIDs
    })
    .then(ids => ArticleLog.find({_id: {$in: ids} }) )
    .then(articles => {

        //add to response data if successful
        if(articles) data.addArticles(articles)

        //condition response status
        let status;

        if(data.columnData == null){
            data.addMessage('Column not found')
            data.addError(true)
            status = 400
        } else {
            status = 200
        }

        //create response object and respond
        const response = data.buildGetColumnResponse()
        res.status(status).json(response)

    })
    .catch(e => {
        data.addError(true)
        const response = data.buildGetColumnResponse()
        res.status(500).json(response)
    })

})//GET /:column

/* 
    POST
*/
//create new column
router.post('/', Authenticate, (req, res) => {

    //response object
    let data = {
        error: new Object,
        title: new String,
        articleIDs: new Array,
        createdColumn: new Object,
        time: new Date().getTime(),
        message: new String
    }

    //add info sent with request to data reponse object
    data.title = req.body.title
    data.articleIDs = req.body.articleIDs

    //validate articleID(s)
    let articleIDsValid = true

    data.articleIDs.forEach(id => {
        let isValid = ObjectId.isValid(id)
        if(isValid == false) articleIDsValid = false
    })
    if(articleIDsValid == false) data.error.articleIDs = 'Invalid Article ID(s) provided'


    //validate title
    let titleValid =  true

    const badTitle = data.title == undefined || data.title.length < 1
    if(badTitle) titleValid = false
    if(titleValid == false) data.error.title = 'Invalid Column Title'

    
    // if(titleValid==false || articleIDsValid==false) data.message = 'Please check error to see further details'
    

    //create column
    const column = new Column({
        _id: new ObjectId(),
        lastUpdated: new Date().getTime(),
        title: data.title,
        articleIDs: data.articleIDs
    })


    //save created column
    column.save()
    .then(savedColumn => {

        data.createdColumn = savedColumn
        
        let status = new Number

        if(savedColumn){
            data.message = 'success'
            status = 200
        } else {
            data.message = 'Please check error to see further details'
            status = 400
        }

        res.status(status).json(data)
    })
    

    //response status
    let status;

    
    

})//POST /:data


module.exports = router;