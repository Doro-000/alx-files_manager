import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(request, response) {
    let token = request.headers['x-token'];
    token = `auth_${token}`;
    const usrId = await redisClient.get(token);
    const usr = await dbClient.filterUser({ _id: usrId });

    if (!usr) {
      response.status(401).json({ error: 'Unauthorized' }).end();
    } else {
      const {
        name, type, parentId, isPublic, data,
      } = request.body;

      // ------------------------ Validation --------------------------------

      if (!name) {
        response.status(400).json({ error: 'Missing name' }).end();
      } else if (!type) {
        response.status(400).json({ error: 'Missing type' }).end();
      } else if (!['folder', 'file', 'image'].includes(type)) {
        response.status(400).json({ error: 'Missing type' }).end();
      } else if (!data && type !== 'folder') {
        response.status(400).json({ error: 'Missing data' }).end();
      } else if (parentId) {
        const folder = dbClient.filterFiles({ _id: parentId });
        if (!folder) {
          response.status(400).json({ error: 'Parent not found' }).end();
        } else if (folder.type !== 'folder') {
          response.status(400).json({ error: 'Parent is not a found' }).end();
        }
      }
      // ------------------------ Validation --------------------------------

      try {
        const insRes = await dbClient.newFile(usrId, name, type, isPublic, parentId, data);
        const docs = insRes.ops[0];
        delete docs.localPath;
        docs.id = docs._id;
        delete docs._id;
        response.status(201).json(docs).end();
      } catch (err) {
        response.status(400).end(err.message);
      }
    }
  }
}
