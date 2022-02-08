import dbClient from '../utils/db';

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
}
