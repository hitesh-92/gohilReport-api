conn = new Mongo("localhost:27017");
db = conn.getDB("gReport");

db.users.insertOne({
  _id: new ObjectId(),
  email: 'test@email.com',
  password: '$2a$04$G32TvV5sLZY0A0b19YzWh.r9SUlZK4KhCbtWd9zw9BVKhem1k8P7e',
  tokens: []
});
