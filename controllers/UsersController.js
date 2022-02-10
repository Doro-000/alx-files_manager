import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(request, response) {
    const { email } = request.body;
    const { password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' }).end();
    } else if (!password) {
      response.status(400).json({ error: 'Missing password' }).end();
    } else {
      try {
        const insertRes = await dbClient.newUser(email, password);
        const { _id } = insertRes.ops[0];
        const _email = insertRes.ops[0].email;
        response.status(201).json({ id: _id, email: _email }).end();
      } catch (err) {
        response.status(400).json({ error: err.message }).end();
      }
    }
  }

  static async getMe(request, response) {
    let token = request.headers['x-token'];
    token = `auth_${token}`;
    const usrId = await redisClient.get(token);
    const usr = await dbClient.filterUser({ _id: usrId });
    if (!usr) {
      response.status(401).json({ error: 'Unauthorized' }).end();
    } else {
      delete usr.password;
      usr.id = usr._id;
      delete usr._id;
      response.status(200).json(usr).end();
    }
  }
}
