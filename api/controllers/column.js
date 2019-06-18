const {
    Types: { ObjectId }
} = require('mongoose');

module.exports = {
  get_allColumns,
  get_singleColumn,
  saveNewColumn,
  updateColumn,
  deleteColumn
}

function get_allColumns (req, res, ArticleLog, Column){

    const data = {}

    const fetchColumns = async () => await Column
    .find({
        'title': { $in: [ 'left', 'center', 'right', 'alert' ] }
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
                .select('_id title url status column position image')
                .sort({position: 1})
                .lean()
                .exec()
            )
        })
    };

    const fetchAllArticles = async (columns) => {
        const requests = columns.map( ({_id}) => articleQuery(_id) )
        return await Promise.all(requests)
    }

    fetchColumns()
    .then(columns => fetchAllArticles(columns)) //returns articles array sorted by column title a-z
    .then( ([alert, center, left, right]) =>
      res.status(200).json({alert, center, left, right})
    );

};

async function get_singleColumn (req, res, ArticleLog, Column){

    const title = req.params.title.toString().toLowerCase();
    let data = { error: true }

    const valid = validateTitle(title);

    if(valid == false) return res.status(404).json(data);

    if(valid === 'ids'){
      data.columns = await fetchAllColumnData();
      data.error = false;
      return res.status(200).json(data);
    }

    // Column.findOne({title: title})
    // .lean()
    // .exec()
    // .then( async (column) => {
    //
    //     data.columnData = column || null
    //
    //     if(column == null) return
    //
    //     return ArticleLog.find({
    //         'column': {$in: column._id}
    //     })
    //     .sort({position: 1})
    //     .lean()
    //     .exec()
    // })
    // .then(articles => {
    //
    //     let status = 200;
    //     data.error = false
    //
    //     if(articles) data.articles = articles
    //
    //     if(data.columnData == null){
    //         data.message = 'Column not found'
    //         data.error = true
    //         status = 400
    //     }
    //
    //     res.status(status).json(data)
    // })
    // .catch(err => {
    //     data.error = { status:true, message:err }
    //     data.message = 'Error processing request'
    //     res.status(500).json(data)
    // })

    // -----

    function validateTitle(title){
      if(title === 'ids') return 'ids';

      const validTitles = ['alert', 'archive', 'left', 'center', 'right'];
      for(let i of validTitles) if(i == title) return true;
      return false;
    }

    async function fetchAllColumnData(){
      return await Column.find({}).select('title').exec();
    }

};

function saveNewColumn (req, res, Column){

    let data = {
        title: req.body.title,
        error: {},
        createdColumn: {},
        saved: false
    }

    if( data.title.trim().length < 4 ) {
        data.error = 'Invalid title'
        return res.status(400).json(data)
    }

    const column = new Column({
        _id: new ObjectId(),
        title: data.title.trim()
    })

    column.save()
    .then(savedColumn => {

        let status = 200
        data.column = savedColumn

        if (!savedColumn){
            stats = 400
            data.message = 'Please check error to see further details'
        }
        else {
            data.saved = true
            data.message = 'success'
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).json(data)
    })
};

function updateColumn (req, res, Column){

    let data = {}

    const { id: columnId, title: updateTitle } = req.body

    const findColumn = async (_id) => await Column
    .findOne( { _id } )
    .select('_id title')
    .lean()
    .exec()

    const updateColumn = async (_id, title) => await Column
    .updateOne( {_id}, { $set: {title} } )
    .exec()

    if( ObjectId.isValid(columnId) == false ) {
        res.status(400).json({error: 'Invalid id'})
        return
    }

    if( String(updateTitle).trim().length < 4 ){
        res.status(400).json({error: 'Invalid update title'})
        return
    }

    findColumn(columnId)
    .then( async (column) => {

        if (!column){
            data.error = 'No column with given id found'
            res.status(400).json(data)
            return
        }

        const savedColumn = await updateColumn(columnId, updateTitle)
        data.column = savedColumn
        res.status(200).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).json(data)
    })
};

function deleteColumn (req,res, Column){

    const { id } = req.body

    let data = {
        deleted: false
    }

    Column
    .findOneAndDelete({ _id: id })
    .exec()
    .then(log => {

        let status = 400

        if(log == null){
            data.message = 'Invalid Column Provided'
        } else {
            status = 200
            data.message = 'success'
            data.deleted = true
        }

        res.status(status).json(data)
    })
    .catch(err => {
        data.error = err
        res.status(500).json(data)
    })

}
