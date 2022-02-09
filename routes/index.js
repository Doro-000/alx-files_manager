import AppController from '../controllers/AppController';
import UserController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const express = require('express');

const router = express.Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UserController.postNew);
router.get('/users/me', UserController.getMe);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

export default router;
