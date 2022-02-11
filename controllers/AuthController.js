import { Buffer } from 'buffer';
import { v4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import UtilController from './UtilController';

export default class AuthController {
  static async getConnect(request, response) {
    try {
      const encodedAuthPair = request.headers.authorization.split(' ')[1];
      const decodedAuthPair = Buffer.from(encodedAuthPair, 'base64').toString().split(':');
      const _email = decodedAuthPair[0];
      const pass = UtilController.SHA1(decodedAuthPair[1]);
      const usr = await dbClient.filterUser({ email: _email });
      if (usr.password !== pass) {
        response.status(401).json({ error: 'Unauthorized' }).end();
      } else {
        const _token = v4();
        await redisClient.set(`auth_${_token}`, usr._id.toString(), 86400);
        response.status(200).json({ token: _token }).end();
      }
    } catch (error) {
      response.status(401).json({ error: 'Unauthorized' }).end();
    }
  }

  static async getDisconnect(request, response) {
    const { token } = request;
    await redisClient.del(token);
    response.status(204).end();
  }
}
