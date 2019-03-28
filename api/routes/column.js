const express = require('express')
const router = express.Router()
const Authenticate = require('../middleware/auth')

const ArticleLog = require('../models/articleLog')
const Column = require('../models/column')

const ObjectId = require('mongoose').Types.ObjectId


router.get('/', (_req,res) => {

    const data = {}

    function getAllQuerys(ids, fn){
        let reqs = []
        ids.forEach(id => {
            reqs.push( fn(id) )
        })
        return async function(){
            const [left, center, right] = await Promise.all(reqs)
            return {left,center,right}
        }
    }

    const getColumns = (column) => {
        return new Promise((resolve) => {
            const query = Column.where({title: column})
            resolve( query.findOne() )
        })
    }

    // const getColumns = (title) => new Promise((resolve) => resolve(Column.where({title}).findOne()))

    const getArticles = (ids) => {
        let queryArr = []
        ids.forEach(id => queryArr.push({_id: id}))

        return new Promise((resolve) => {
            resolve( ArticleLog.find({_id: {$in:queryArr} }) )
        })
    }

    const getIDsArray = (columns) => {
        return [
            columns.left.articleIDs,
            columns.center.articleIDs,
            columns.right.articleIDs
        ]
    }

    const columns = ['left','center','right']

    const queryColumns = getAllQuerys(columns, getColumns)

    queryColumns().then(columns => {
        data.columns = columns
        // const queryArticles = getAllQuerys(getIDsArray(columns), getArticles)
        // return queryArticles()
        return getAllQuerys(getIDsArray(columns), getArticles)()
    })
    .then(articles => {
        data.leftArticles = articles.left
        data.centerArticles = articles.center
        data.rightArticles = articles.right

        res.status(200).send(data)
    })

});


router.get('/:column', (req, res) => {

    let title = req.params.column

    let data = {
        time: new Date().getTime(),
        requestedColumn: title,
        columnData: new Object,
    }

    //returns array of ids to find in db
    const getIdsToFind = (ids) => {

        let idsArr = []

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
        //condition response status
        let status;

        //add to response data if successful
        if(articles) data.articles = articles

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
    .catch(_e => {
        data.error = true
        data.message = 'Error processing request'
        res.status(500).json(data)
    })

})


router.post('/', Authenticate, (req, res) => {

    //response object
    let data = {
        error: {},
        createdColumn: {},
        time: new Date().getTime()
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

    if(articleIDsValid === false) data.error.articleIDs = 'Invalid Article ID(s) provided'

    //validate title
    let titleValid =  true
    const badTitle = data.title == undefined || data.title.length < 1
    if(badTitle) titleValid = false
    if(titleValid == false) data.error.title = 'Invalid Column Title'   

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

        let status = 200
        data.createdColumn = savedColumn
        data.message = 'success'

        if (!savedColumn){
            stats = 400
            data.message = 'Please check error to see further details'
        }

        res.status(status).json(data)
    })
    
})


router.patch('/:column', Authenticate, (req,res) => {
/*
    //data from request
    const columnSelected = req.params.column
    const columnArticlesToEnter = req.body.ids

    //Create Data Object
    class Data {

        constructor(newArticles) {
            this.columnsArticlesToEnter = newArticles;
            this.error = {};
        }

        addColumnSelected(columnSelected) {
            this.columnSelected = columnSelected;
        }

        addColumnArticleIDs(columnArticles) {
            this.columnArticles = columnArticles;
        }

        concatArticles() {
            const currentIDs = this.columnSelected.articleIDs;
            this.newArticleIDs = [...currentIDs, ...this.columnsArticlesToEnter];
        }

        dataToUpdate() {
            //create array with _id and Column log body to be updated
            const toSave = [
                this.columnSelected._id,
                {
                    title: this.columnSelected.title,
                    lastUpdated: new Date().getTime(),
                    articleIDs: this.newArticleIDs
                }
            ];
            //save to object and return
            this.articleLogSaved = toSave;
            return toSave;
        }

        addMessage(message) {
            this.message = message;
        }

        columnNotFound() {
            this.error.message = 'Invalid Column Requested';
            return null
        }

        invalidIDProvided() {
            this.error.articleIDs = true;
            this.error.message = 'Invalid article ID provided. Check entry';
            return null
        }

        addError(err){
            this.error.info = err
        }
    }


    //filter id(s) and check if valid
    // function to check if id is ObjectID
    const checkId = id => ObjectId.isValid(id) == true

    // filter array using the checkId function
    const fitleredIDs = columnArticlesToEnter.filter(id => checkId(id))

    // filteredIDs length should be same as columnArticlesToEnter
    const IDsValid = fitleredIDs.length == columnArticlesToEnter.length


    //Create Data object
    let data = new Data(columnArticlesToEnter)
    
    //find requested column in db
    Column.find({title: columnSelected})
    .then(columnData => {
    
        // case for column not found
        if(columnData.length == 0) return data.columnNotFound()
        else if(IDsValid == false) return data.invalidIDProvided()

        //add column to data
        data.addColumnSelected(columnData[0])

        //concat articleID arrays
        data.concatArticles()

        return data.dataToUpdate()
    })
    .then(info => {
        
        if(info === undefined || info === null) return

        //sort data from info array
        const id = info[0]
        const body = info[1]

        //update Column log
        return Column.updateOne(
            { _id: id },
            { $set: body }
        )
    })
    .then(saveResponse => {

        //saveResponse: { n: 1, nModified: 1, ok: 1 } //status:200
        
        let status = 200
        if(saveResponse == undefined && data.error.articleIDs) status = 400
        else if (saveResponse === undefined) status = 404
        else if(saveResponse.ok == 1) data.addMessage('success')

        res.status(status).send(data)
    })
    .catch(err => {
        data.addError(err)
        res.status(500).send(data)
    })

*/



    let data = {}

    const columnTitle = req.params.column
    const newArticleIDs = req.body.ids
    
    function updateColumn(column, idsArray){

        const id = column._id
        const body = {
            title: column.title,
            lastUpdated: new Date().getTime(),
            articleIDs: idsArray
        }

        return async function(){
            return Column.updateOne( {_id:id}, {$set:body} )
        }
        // return async () => Column.updateOne( {_id:id}, {$set:body} )
    }

    const validateIDs = (arr) => {

        let badID = []

        for (i in arr){
            let id = arr[i]

            const validID = ObjectId.isValid(id)
            if( validID===false ) badID.push(id)
        }


        if ( badID.length===0 ) return true
        else return false

    }

    //check for any invalid IDs
    const ids_valid = validateIDs(newArticleIDs)
    if( ids_valid===false ){    
        data.error = { message: 'Invalid article ID provided. Check entry' }
        res.status(400).send(data)
        return
    }

    Column.find({title: columnTitle})
    .then(column => {

        // column not found
        if(column.length === 0){
            data.error = { message: 'Invalid Column Requested' }
            return null
        }

        //create new IDs array to update column with
        const newIDsArray = [...column[0].articleIDs, ...newArticleIDs]

        data.column = column
        data.newArticleIDs = newIDsArray

        return updateColumn(column[0], newIDsArray)()
    })
    .then(response => {
        let status = 200

        console.log('#####', response)

        if(response===null) status = 404
        else data.message = 'success'
        
        res.status(status).send(data)
    })






    





})


router.delete('/:column', Authenticate, (req,res) => {

    const columnSelected = req.params.column

    let data = {
        deleteRequest: columnSelected,
        deleted: false,
        message: 'success'
    }

    Column.findOneAndDelete({title: columnSelected})
    .then(log => {

        let status = 200
        
        if(log == null){
            status = 400
            data.message = 'Invalid Column Provided'
        } 
        else data.deleted = true

        res.status(status).send(data)
    })

})

module.exports = router;