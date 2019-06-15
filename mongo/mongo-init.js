db = db.getSiblingDB('gReport');

var [columns, articles] = buildData();

let res = [
  db.articlelogs.drop(),
  db.columns.drop(),
  db.users.drop(),
  db.columns.insertMany(columns),
  db.articlelogs.insertMany(articles),
  db.users.insertOne({
    _id: new ObjectId(),
    email: 'test@email.com',
    password: '$2a$04$G32TvV5sLZY0A0b19YzWh.r9SUlZK4KhCbtWd9zw9BVKhem1k8P7e',
    tokens: []
  })
]

printjson(res);

function buildData(){
  let columns = [], articles = [];
  var columnTitles = [
    'left',
    'center',
    'right',
    'alert',
    'archive'
  ];

  columnTitles.forEach(title => {
    let [cols, arts] = build(title);
    columns = [...columns, ...cols];
    articles = [... articles, ...arts];
  });

  return [columns, articles];
};

function build(title){

  let id = new ObjectId();

  return[ buildColumn(id, title), buildArticles(id, title) ];

  function buildColumn(_id, title){
    return [{
      _id,
      title,
      createdAt: ISODate(),
      updatedAt: ISODate()
    }];
  };

  function buildArticles(columnId, columnTitle){
    let articles = [];

    for (let i=0; i<9; i++){
      let status = i==8 ? 0 : parseInt(i/2);
      let title = `${columnTitle}-${i}`;

      articles.push({
        _id: new ObjectId,
        title: title,
        url: `www.${title}.com`,
        image: `www.${title}-image.com`,
        position: NumberInt(i+1),
        column: columnId,
        status: NumberInt(status),
        createdAt: ISODate(),
        updatedAt: ISODate()
      });
    }

    return articles;
  };

};
