import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(request, response) {
    const { email } = request.body;
    const { password } = request.body;
    if (!email) {
      response.status(400).end('Missing email');
    } else if (!password) {
      response.status(400).end('Missing password');
    } else {
      try {
        const insertRes = await dbClient.newUser(email, password);
        const { _id } = insertRes.ops[0];
        const _email = insertRes.ops[0].email;
        response.status(201).json({ id: _id, email: _email }).end();
      } catch (err) {
        response.status(400).end(err.message);
      }
    }
  }

  static async getMe(request, response) {
    let token = request.headers['x-token'];
    if (!token) {
      response.status(401).json({ error: 'Unauthorized' }).end();
    } else {
      token = `auth_${token}`;
      const usrId = await redisClient.get(token);
      const usr = await dbClient.filterUser({ _id: usrId });
      if (!usr) {
        response.status(401).json({ error: 'Unauthorized' }).end();
      } else {
        delete usr.password;
        response.status(200).json(usr).end();
      }
    }
  }
}
