import { env } from 'process';
import { MongoClient } from 'mongodb';
import { createHash } from 'crypto';

class DBClient {
  static SHA1(str) {
    return createHash('SHA1').update(str).digest('hex');
  }

  constructor() {
    const host = env.DB_HOST ? env.DB_HOST : '127.0.0.1';
    const port = env.DB_PORT ? env.DB_PORT : 27017;
    const database = env.DB_DATABASE ? env.DB_DATABASE : 'files_manager';
    this.myClient = MongoClient(`mongodb://${host}:${port}/${database}`);
    this.myClient.connect();
  }

  isAlive() {
    return this.myClient.isConnected();
  }

  async nbUsers() {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('users');
    return myCollection.countDocuments();
  }

  async nbFiles() {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('files');
    return myCollection.countDocuments();
  }

  async newUser(_email, password) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('users');

    if (await myCollection.findOne({ email: _email })) {
      throw new Error('Already exists');
    }
    const passwordHash = DBClient.SHA1(password);
    return myCollection.insertOne({ email: _email, password: passwordHash });
  }
}

const dbClient = new DBClient();

export default dbClient;
