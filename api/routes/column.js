const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')

const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

const ObjectId = require('mongoose').Types.ObjectId


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
//get column by name
router.get('/:column', Authenticate, (req, res) => {

    let title = req.params.column

    let data = {
        time: new Date().getTime(),
        requestedColumn: title,
        columnData: new Object,
    }

    //returns array of ids to find in db
    const getIdsToFind = (ids) => {

        const idsArr = new Array

        ids.forEach(id => idsArr.push({_id: id}))

        return idsArr
    }

    Column.findOne({title})
    .then(singleColumn => {

        data.columnData = singleColumn

        //return if no column found
        if(singleColumn == null) return

        //return articles ids to query db
        const queryIDs = getIdsToFind(singleColumn.articleIDs)

        return queryIDs

    })
    .then(ids => ArticleLog.find({_id: {$in: ids} }) )
    .then(articles => {

        //add to response data if successful
        if(articles) data.articles = articles

        //condition response status
        let status;

        if(data.columnData == null){

            data.message = 'Column not found'

            data.error = true 

            status = 400

        } else {

            status = 200

            data.error = false

        }

        res.status(status).json(data)

    })
    .catch(e => {

        data.error = true

        data.message = 'Error processing request'

        res.status(500).json(data)

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
    
})//POST /:data


/*
    PATCH
*/
//
router.patch('/:column', Authenticate, (req,res) => {

    //data from request
    const columnSelected = req.params.column
    const columnArticlesToEnter = req.body.ids

    //Create Data Object
    function Data(newArticles){
        this.columnsArticlesToEnter = newArticles
        this.error = new Object
    }

    Data.prototype.addColumnSelected = function addColumnSelected(columnSelected){
        this.columnSelected = columnSelected
    }
    Data.prototype.addColumnArticleIDs = function addColumnArticles(columnArticles){
        this.columnArticles = columnArticles
    }
    Data.prototype.concatArticles = function joinArticleIDs(){
        const currentIDs = this.columnSelected.articleIDs
        this.newArticleIDs = [...currentIDs, ...this.columnsArticlesToEnter]
    }
    Data.prototype.dataToUpdate = function getDataToInsert(){
        //return column id and ArticleLog body to be updated
        const toSave = [
            this.columnSelected._id,
            {
                title: this.columnSelected.title,
                lastUpdated: new Date().getTime(),
                articleIDs: this.newArticleIDs
            }
        ]

        this.articleLogSaved = toSave
        return toSave
    }
    Data.prototype.addMessage = function saveMessage(message){
        this.message = message
    }
    // Data.prototype.columnNotFound = function addNewError(){
    //     this.error = true
    //     this.error.message = 'No column found by given name'
    // }

    let data = new Data(columnArticlesToEnter)
    data.addColumnSelected(columnSelected)

    // console.log(data)
    
    //find requested column in db
    Column.find({title: columnSelected})
    .then(columnData => {

        //case for column not found
        // if(columnData.length == 0) return data.columnNotFound()

        const column = columnData[0]

        //add column to data
        data.addColumnSelected(column)

        //concat articleID arrays
        data.concatArticles()

        return data.dataToUpdate()

    })
    .then(info => {

        //sort data from info array
        const id = info[0], body = info[1]

        //update Column log
        return Column.updateOne(
            { _id: id },
            { $set: body }
        )

    })
    .then(saveResponse => {

        //saveResponse: { n: 1, nModified: 1, ok: 1 }
        
        //set res status and execute response + send data Object
        let status;

        if(saveResponse.ok == 1) {
            status = 200
            data.addMessage('success')
        }
        
        res.status(status).send(data)

    })

})//PATCH /:column

module.exports = router;