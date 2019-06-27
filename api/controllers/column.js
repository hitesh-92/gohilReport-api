const {
  Types: {
    ObjectId
  }
} = require('mongoose');

module.exports = {
  get_allColumns,
  get_singleColumn,
  saveNewColumn,
  updateColumn,
  deleteColumn
}

function get_allColumns(req, res, ArticleLog, Column) {

  const data = {}

  const fetchColumns = async () => await Column
    .find({
      'title': {
        $in: ['left', 'center', 'right', 'alert']
      }
    })
    .select('_id title')
    .lean()
    .exec()

  const articleQuery = async (column) => {
    return new Promise((resolve) => {
      resolve(
        ArticleLog.find({
          'column': {
            $in: column
          }
        })
        .select('_id title url status column position image')
        .sort({
          position: 1
        })
        .lean()
        .exec()
      )
    })
  };

  const fetchAllArticles = async (columns) => {
    const requests = columns.map(({
      _id
    }) => articleQuery(_id))
    return await Promise.all(requests)
  }

  fetchColumns()
    .then(columns => fetchAllArticles(columns)) //returns articles array sorted by column title a-z
    .then(([alert, center, left, right]) =>
      res.status(200).json({
        alert,
        center,
        left,
        right
      })
    );

};

async function get_singleColumn(req, res, ArticleLog, Column) {

  const title = req.params.title.toString().toLowerCase();

  let data = {
    error: true,
    columnData: null
  };

  const valid = validateTitle(title);

  if (valid == false) {
    data.message = 'Column not found';
    return res.status(400).json(data);
  }

  if (valid === 'ids') {
    data.columns = await fetchAllColumnData();
    data.error = false;
    return res.status(200).json(data);
  }

  const [columnData, fetchColumnArticles] = await fetchColumn(title);

  if (columnData == false) {
    data.message = 'Column not found'
    return res.status(400).json(data);
  }

  data.columnData = columnData;
  data.articles = await fetchColumnArticles();
  data.error = false;

  res.status(200).json(data);

  // -----

  function validateTitle(title) {
    if (title === 'ids') return 'ids';

    const validTitles = ['alert', 'archive', 'left', 'center', 'right'];
    for (let i of validTitles)
      if (i == title) return true;
    return false;
  }

  async function fetchAllColumnData() {
    return await Column.find({}).select('title').exec();
  }

  async function fetchColumn(title) {

    var column = await findColumnByTitle(title);

    if (column == null) return [false, false];
    else return [column, fetchArticles];

    async function fetchArticles() {
      return await findArticleByColumn(column._id);
    };

  }

  async function findColumnByTitle(title) {
    return await Column.findOne({
        title
      })
      .select('title')
      .lean()
      .exec();
  }

  async function findArticleByColumn(columnId) {
    return await ArticleLog.find({
        'column': {
          $in: columnId
        }
      })
      .sort({
        position: 1
      })
      .lean()
      .exec();
  }

};

function saveNewColumn(Column) {
  return async function handleSavingNewColumn(req, res){

    { //tmp validations
      let hasTitle = req.body.hasOwnProperty('title');
      if( hasTitle === false ) return res.status(400).json({saved: false, error: 'Invalid title'});
    }
    {
      req.body.title = req.body.title.trim();
      let validTitle = req.body.title.length > 4;
      if( validTitle === false ) return res.status(400).json({saved: false, error: 'Invalid title'});
    }


    var column = createColumn(req.body);
    await column.save();
    res.json({saved:true, column});

    // -----

    function createColumn({title}){
      return new Column({
        _id: new ObjectId(),
        title
      });
    };

  }
};

function updateColumn(Column) {
  return async function handleUpdateColumn(req, res){

    { //tmp validations
      let validColumnId = ObjectId.isValid(req.body.id);
      if( validColumnId === false ) return res.status(400).json({error: 'Invalid id'});
    }
    {
      let hasTitle = req.body.hasOwnProperty('title');
      if( hasTitle === false ) return res.status(400).json({error: 'Invalid update title'});
    }
    {
      let titleLength = req.body.title.trim().length;
      if( titleLength < 4 ) return res.status(400).json({error: 'Invalid update title'});
    } // end validations


    const [validColumn, updateColumn] = await fetchColumn(req.body);

    if( validColumn === false ) return res.status(400).json({error: 'No column with given id found'});

    const { nModified: updated } = await updateColumn();

    if( updated !== 1  ) return res.status(400).json({error: 'Update invalid'});

    res.json({updated: true});

    // -----

    async function fetchColumn({id, title}){
      var column = await fetchColumnById(id);

      if( column === null ) return [false, null];
      else return [true, handleColumnUpdate];

      async function handleColumnUpdate(){
        return await updateColumnTitle(id, title);
      }

    };

    async function fetchColumnById(id){
      return await Column.findOne({ _id: id }).select('title').lean().exec();
    }

    async function updateColumnTitle(id, title){
      return await Column.updateOne(
        { _id: id },
        { $set: { title } }
      );
    };

  }
};

function deleteColumn(req, res, Column) {

  const {
    id
  } = req.body

  let data = {
    deleted: false
  }

  Column
    .findOneAndDelete({
      _id: id
    })
    .exec()
    .then(log => {

      let status = 400

      if (log == null) {
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
