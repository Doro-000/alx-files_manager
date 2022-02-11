/* eslint-disable no-param-reassign */
import { createHash } from 'crypto';
import { promises } from 'fs';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const { open } = promises;

export default class UtilController {
  static SHA1(str) {
    return createHash('SHA1').update(str).digest('hex');
  }

  static async readFile(path) {
    return (await open(path)).readFile();
  }

  static async token(request, response, next) {
    let token = request.headers['x-token'];
    token = `auth_${token}`;
    const usrId = await redisClient.get(token);
    const usr = await dbClient.filterUser({ _id: usrId });

    if (!usr) {
      response.status(401).json({ error: 'Unauthorized' }).end();
    } else {
      request.usr = usr;
      request.token = token;
      next();
    }
  }
}
