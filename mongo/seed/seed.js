conn = new Mongo("localhost:27017");
db.auth('admin', 'password');
db = conn.getDB("gReport");

columns = [
  'left',
  'center',
  'right',
  'alert',
  'archive'
];

columnIds = columns.map(() => new ObjectId());

columns.forEach((col, i) => {
  insertColumn(col, columnIds[i]);
  insertArticles(col, columnIds[i]);
});

db.users.insertOne({
  _id: new ObjectId(),
  email: 'test@email.com',
  password: '$2a$04$G32TvV5sLZY0A0b19YzWh.r9SUlZK4KhCbtWd9zw9BVKhem1k8P7e',
  tokens: []
});


// ----

function insertColumn(title, _id){
  db.columns.insertOne({
    _id,
    title,
    createdAt: ISODate(),
    updatedAt: ISODate()
  });
}

function insertArticles(columnTitle, columnId){
  let articles = buildArticles(columnTitle, columnId);
  db.articlelogs.insertMany(articles);
};

function buildArticles(columnTitle, columnId){
  let articles = [];

  for(let i = 0; i < 9; i++){

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
}
