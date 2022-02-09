import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(request, response) {
    response.status(200).json(
      {
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
      },
    ).end();
  }

  static async getStats(request, response) {
    response.status(200).json(
      {
        users: await dbClient.nbUsers(),
        files: await dbClient.nbFiles(),
      },
    ).end();
  }
}

export default AppController;
