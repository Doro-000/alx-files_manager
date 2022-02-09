import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');

class UsersController {
  static async hash(field) {
    const hash = crypto.createHash('sha1').update(field.password).digest('hex');
    return dbClient.nbUsers_insert({ email: field.email, password: hash });
  }

  static async postNew(request, response) {
    try {
      const field = request.body;
      const searchTemp = JSON.parse(JSON.stringify(field));
      delete searchTemp.password;
      response.set('Content-Type', 'text/plain');
      if (Object.keys(field).includes('email') === false) {
        response.status(400).end('Missing email');
      } else if (Object.keys(field).includes('password') === false) {
        response.status(400).end('Missing password');
      } else if (await dbClient.nbUsers_find(searchTemp) === null) {
        const main = await UsersController.hash(field);
        response.status(201).json({ _id: main.ops[0]._id, email: field.email }).end();
      } else {
        response.status(400).end('Already exist');
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async getMe(request, response) {
    const MainToken = request.headers['x-token'];
    const key = `auth_${MainToken}`;
    const id = await redisClient.get(key);
    const { email } = await dbClient.nbUsers_find({ id });
    if (email && id && MainToken) {
      response.json({ id, email }).end();
    } else {
      response.status(401).json({ error: 'Unauthorized' }).end();
    }
  }
}

export default UsersController;
