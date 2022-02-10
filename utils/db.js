/* eslint-disable no-param-reassign */
import { Buffer } from 'buffer';
import { env } from 'process';
import { MongoClient, ObjectID } from 'mongodb';
import { createHash } from 'crypto';
import { v4 } from 'uuid';
import { promises } from 'fs';

const { open, mkdir } = promises;

export class DBClient {
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

  // ---------------------------------------------------------------- users -----------

  async nbUsers() {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('users');
    return myCollection.countDocuments();
  }

  async newUser(_email, password) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('users');

    if (await myCollection.findOne({ email: _email })) {
      throw new Error('Already exist');
    }
    const passwordHash = DBClient.SHA1(password);
    return myCollection.insertOne({ email: _email, password: passwordHash });
  }

  async filterUser(filters) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('users');
    if ('_id' in filters) {
      filters._id = ObjectID(filters._id);
    }
    return myCollection.findOne(filters);
  }

  // ---------------------------------------------------- Files -----------------------------------

  async nbFiles() {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('files');
    return myCollection.countDocuments();
  }

  async newFile(_userId, _name, _type, _isPublic = false, _parentId = 0, _data = null) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('files');

    const fileRecord = {
      userId: ObjectID(_userId),
      name: _name,
      type: _type,
      parentId: _parentId,
      isPublic: _isPublic,
    };

    const folderPath = env.FOLDER_PATH ? env.FOLDER_PATH : '/tmp/files_manager';
    const storeName = `${folderPath}/${v4()}`;

    if (_type === 'file') {
      const File = await open(storeName, 'w');
      await File.writeFile(Buffer.from(_data, 'base64').toString());
      fileRecord.localPath = storeName;
      File.close();
    } else if (_type === 'image') {
      const File = await open(storeName, 'w');
      await File.writeFile(Buffer.from(_data, 'base64'));
      fileRecord.localPath = storeName;
      File.close();
    } else if (_type === 'folder') {
      await mkdir(storeName);
    }
    return myCollection.insertOne(fileRecord);
  }

  async filterFiles(filters) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('files');
    const idFilters = ['_id', 'userId', 'parentId'].filter((prop) => prop in filters && filters[prop] !== '0');
    idFilters.forEach((i) => {
      filters[i] = ObjectID(filters[i]);
    });
    return myCollection.findOne(filters);
  }

  async findFiles(filters, options = {}) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('files');
    const idFilters = ['_id', 'userId', 'parentId'].filter((prop) => prop in filters && filters[prop] !== '0');
    idFilters.forEach((i) => {
      filters[i] = ObjectID(filters[i]);
    });
    return myCollection.find(filters, options);
  }

  async updatefiles(filters, options = {}) {
    const myDB = this.myClient.db();
    const myCollection = myDB.collection('files');
    await myCollection.updateOne(filters, { $set: options });
    return myCollection.findOne(filters);
  }

  static async readFile(path) {
    return (await open(path)).readFile();
  }
}

const dbClient = new DBClient();

export default dbClient;
