const router = require('express').Router()
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

// return data for a single column (useful for alert section)
// set up check to ony allow 'right,middle,left,alert' columns
router.get('/:column', Authenticate, (req, res) => {

    const title = req.params.column

    // TypeError: Converting circular structure to JSON
    let response = new Object()

    Column.findOne({title})
    .then(data => {
        response.requestedColumn = title
        response.columnData = data

        //fail case
        if(data == null){
            response.message = 'Column not found'
            return res.status(404).json(response)
        }

        // create array of IDs to query DB
        let idsToFind = new Array();

        data.articleIDs.forEach(id => {
            idsToFind.push({_id: id})
        })

        return ArticleLog.find({_id: {$in: idsToFind} })
    })
    .then(data => {
        response.articles = data
        res.status(200).json(response)
    })
    .catch(error => {
        response.error =  error
        response.message = 'Column not found. Try again or Contact'
        res.status(404).json(response)
    })

})

module.exports = router;