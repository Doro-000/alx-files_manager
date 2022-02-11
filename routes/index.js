import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import UtilController from '../controllers/UtilController';

const router = Router();

// requireAuth
router.use((request, response, next) => {
  const paths = ['/connect'];
  if (!paths.includes(request.path)) {
    next();
  } else if (!request.headers.authorization) {
    response.status(401).json({ error: 'Unauthorized' }).end();
  } else {
    next();
  }
});

// requireSession
router.use((request, response, next) => {
  const paths = ['/disconnect', '/users/me', '/files'];
  if (!paths.includes(request.path)) {
    next();
  } else if (!request.headers['x-token']) {
    response.status(401).json({ error: 'Unauthorized' }).end();
  } else {
    next();
  }
});

// ------------------- Users & misc ----------------------------
router.get('/users/me', UtilController.token, UsersController.getMe);
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', UtilController.token, AuthController.getDisconnect);

// ---------------------- files --------------------------------
router.post('/files', UtilController.token, FilesController.postUpload);

router.get('/files/:id', UtilController.token, FilesController.getShow);
router.get('/files', UtilController.token, FilesController.getIndex);
router.get('/files/:id/data', UtilController.token, FilesController.getFile);

router.put('/files/:id/publish', UtilController.token, FilesController.putPublish);
router.put('/files/:id/unpublish', UtilController.token, FilesController.putUnpublish);

export default router;
