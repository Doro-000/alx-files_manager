import express from 'express';
import { env } from 'process';
import bodyParser from 'body-parser';
import { router } from './routes/index';

const port = env.PORT ? env.PORT : 5000;
const app = express();
app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.json());
app.use(router);
app.listen(port, '127.0.0.1');

export default app;
