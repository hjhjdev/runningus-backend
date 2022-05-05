import '@utilities/environment.util';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import json from 'koa-json';
import routerV1 from '@routers/v1';
// import authJwt from '@middlewares/auth-jwt.middleware';
import { Logger } from '@utilities/winston-logger.util';

const app = new Koa();
const port = process.env.APP_PORT || 6000;

// 미들웨어 등록
app.use(helmet());
app.use(cors());
app.use(json());
app.use(bodyParser());
app.use(logger());
// app.use(authJwt);
app.use(routerV1.routes());
app.use(routerV1.allowedMethods());

app.listen(port, () => {
  const message = `[SSTM] Runninus_backend listening on the port ${port}`;
  const wrapCharacter = '@'.repeat(message.length);

  Logger.info(wrapCharacter);
  Logger.info(message);
  Logger.info(wrapCharacter);
});
