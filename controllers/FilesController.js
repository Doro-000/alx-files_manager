/* eslint-disable no-param-reassign */
import { contentType } from 'mime-types';
import dbClient from '../utils/db';
import UtilController from './UtilController';

export default class FilesController {
  static async postUpload(request, response) {
    console.log(request.usr);
    const usrId = request.usr._id;
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
    } else {
      try {
        let flag = false;
        if (parentId) {
          const folder = await dbClient.filterFiles({ _id: parentId });
          if (!folder) {
            response.status(400).json({ error: 'Parent not found' }).end();
            flag = true;
          } else if (folder.type !== 'folder') {
            response.status(400).json({ error: 'Parent is not a folder' }).end();
            flag = true;
          }
        }
        if (!flag) {
          const insRes = await dbClient.newFile(usrId, name, type, isPublic, parentId, data);
          const docs = insRes.ops[0];
          delete docs.localPath;
          docs.id = docs._id;
          delete docs._id;
          response.status(201).json(docs).end();
        }
      } catch (err) {
        response.status(400).json({ error: err.message }).end();
      }
    }
  }

  static async getShow(request, response) {
    const usrId = request.usr._id;
    const { id } = request.params;
    const file = await dbClient.filterFiles({ _id: id });
    if (!file) {
      response.status(404).json({ error: 'Not found' }).end();
    } else if (String(file.userId) !== usrId) {
      response.status(404).json({ error: 'Not found' }).end();
    } else {
      response.status(200).json(file).end();
    }
  }

  static async getIndex(request, response) {
    const usrId = request.usr._id;
    const _parentId = request.query.parentId ? request.query.parentId : '0';
    const page = request.query.page ? request.query.page : 0;
    const cursor = await dbClient.findFiles(
      { parentId: _parentId, userId: usrId },
      { limit: 20, skip: 20 * page },
    );
    const res = await cursor.toArray();
    res.map((i) => {
      i.id = i._id;
      delete i._id;
      return i;
    });
    response.status(200).json(res).end();
  }

  static async putPublish(request, response) {
    const userId = request.usr._id;
    const file = await dbClient.filterFiles({ _id: request.params.id });
    if (!file || String(file.userId) !== userId) {
      response.status(404).json({ error: 'Not found' }).end();
    } else {
      const newFile = await dbClient.updatefiles({ _id: file._id }, { isPublic: true });
      response.status(200).json(newFile).end();
    }
  }

  static async putUnpublish(request, response) {
    const userId = request.usr._id;
    const file = await dbClient.filterFiles({ _id: request.params.id });
    if (!file || String(file.userId) !== userId) {
      response.status(404).json({ error: 'Not found' }).end();
    } else {
      const newFile = await dbClient.updatefiles({ _id: file._id }, { isPublic: false });
      response.status(200).json(newFile).end();
    }
  }

  static async getFile(request, response) {
    const usrId = request.usr._id;
    const file = await dbClient.filterFiles({ _id: request.params.id });
    if (!file) {
      response.status(404).json({ error: 'Not found' }).end();
    } else if (file.type === 'folder') {
      response.status(400).json({ error: "A folder doesn't have content" }).end();
    } else if ((String(file.userId) === usrId) || file.isPublic) {
      try {
        const content = UtilController.readFile(file.localPath);
        const header = { 'Content-Type': contentType(file.localPath) };
        response.set(header).status(200).send(content).end();
      } catch (err) {
        response.status(404).json({ error: 'Not found' }).end();
      }
    } else {
      response.status(404).json({ error: 'Not found' }).end();
    }
  }
}
