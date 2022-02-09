import env from 'process';
import router from './routes/index';

const express = require('express');
const bodyParser = require('body-parser');

const port = env.PORT ? env.PORT : '5000';
const app = express();

app.use(bodyParser.json());
app.use(router);
app.listen(port, 'localhost');

export default app;
