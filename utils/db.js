const { MongoClient } = require('mongodb');
const { env } = require('process');
const { ObjectId } = require('mongodb');

class DBClient {
  constructor() {
    const host = env.DB_HOST ? env.DB_HOST : 'localhost';
    const port = env.DB_PORT ? env.DB_PORT : '27017';
    const database = process.env.DB_DATABASE ? process.env.DB_DATABASE : 'files_manager';
    const url = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) { console.log(err); }
    });
    // this.client.db().collection('users').insertMany([
    //   { a: 1 }, { a: 2 }, { a: 3 },
    // ]);
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const dbC = this.client.db().collection('users');
    return dbC.countDocuments();
  }

  async nbUsers_find(field) {
    const dbC = this.client.db().collection('users');
    if (field.id) {
      field._id = ObjectId(field.id);
      delete field.id;
    }
    return dbC.findOne(field);
  }

  async nbUsers_insert(field) {
    const dbC = this.client.db().collection('users');
    return dbC.insertOne(field);
  }

  async nbFiles() {
    const dbC = this.client.db().collection('files');
    return dbC.countDocuments();
  }
}

const dbClient = new DBClient();

module.exports = dbClient;
