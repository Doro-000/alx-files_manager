import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const crypto = require('crypto');

class AuthController {
  // static async hash(field) {
  //   const hash = crypto.createHash('sha1').update(field.password).digest('hex');
  //   return dbClient.nbUsers_insert({ email: field.email, password: hash });
  // }

  static async getConnect(request, response) {
    const MainHeader = request.headers.authorization;
    const decodedStringAtoB = Buffer.from(MainHeader.split(' ')[1], 'base64').toString().split(':');
    const valueC = await dbClient.nbUsers_find({ email: decodedStringAtoB[0] });
    if (valueC !== null) {
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, valueC._id.toString(), 86400);
      response.status(200).json({ token }).end();
    } else {
      response.status(401).end('Unauthorized');
    }
    // const auth = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  static async getDisconnect(request, response) {
    const MainToken = request.headers['x-token'];
    const key = `auth_${MainToken}`;
    const id = await redisClient.get(key);
    const field = await dbClient.nbUsers_find({ id });
    if (field && id && MainToken) {
      await redisClient.del(key);
      response.status(201).end();
      return;
    }
    response.status(401).json({ error: 'Unauthorized' }).end();
  }
}

export default AuthController;
