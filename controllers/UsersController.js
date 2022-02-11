import dbClient from '../utils/db';
import UtilController from './UtilController';

export default class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' }).end();
    } else if (!password) {
      response.status(400).json({ error: 'Missing password' }).end();
    } else {
      try {
        const passwordHash = UtilController.SHA1(password);
        const insertRes = await dbClient.newUser(email, passwordHash);
        const { _id } = insertRes.ops[0];
        const _email = insertRes.ops[0].email;
        response.status(201).json({ id: _id, email: _email }).end();
      } catch (err) {
        response.status(400).json({ error: err.message }).end();
      }
    }
  }

  static async getMe(request, response) {
    const { usr } = request;
    delete usr.password;
    usr.id = usr._id;
    delete usr._id;
    response.status(200).json(usr).end();
  }
}
