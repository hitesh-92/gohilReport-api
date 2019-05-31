const {
    Types: { ObjectId }
} = require('mongoose');

const get_allColumns = (req, res, ArticleLog, Column) => {

    const data = {}

    const fetchColumns = async () => await Column
    .find({
        'title': {$in: [ 'left', 'center', 'right' ]}
    })
    .select('_id title')
    .lean()
    .exec()

    const articleQuery = async (column) => {
        return new Promise((resolve) => {
            resolve(
                ArticleLog.find({
                    'column': {$in: column}
                })
                .select('_id title url status column')
                .lean()
                .exec()
            )
        })
    }

    const fetchAllArticles = async (columns) => {
        const requests = columns.map( ({_id}) => articleQuery(_id) )
        return await Promise.all(requests)
    }


    fetchColumns()
    .then(columns => fetchAllArticles(columns))
    .then( ([center, left, right]) =>
      res.status(200).json({left, center, right})
    )
};

const get_singleColumn = (req, res, ArticleLog, Column) => {

    const { title } = req.body

    let data = {}

    Column.findOne({title})
    .lean()
    .exec()
    .then( async (column) => {

        data.columnData = column || null

        if(column == null) return

        return ArticleLog.find({
            'column': {$in: column._id}
        })
        .lean()
        .exec()
    })
    .then(articles => {

        let status = 200;
        data.error = false

        if(articles) data.articles = articles

        if(data.columnData == null){
            data.message = 'Column not found'
            data.error = true
            status = 400
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = { status:true, message:err }
        data.message = 'Error processing request'
        res.status(500).json(data)
    })

}

module.exports = {
  get_allColumns,
  get_singleColumn
}
