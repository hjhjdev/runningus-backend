import '@utilities/environment.util';
import Koa from 'koa';
import { createServer } from 'http';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import helmet from 'koa-helmet';
import cors from '@koa/cors';
import json from 'koa-json';
import routerV1 from '@routers/v1';
// import authJwt from '@middlewares/auth-jwt.middleware';
import { SocketServer } from '@middlewares/socket.middleware';
import { Logger } from '@utilities/winston-logger.util';

const httpApp = new Koa();
const server = createServer(httpApp.callback());
const webSocketApp = new SocketServer(server);
const port = process.env.APP_PORT || 6000;

// 미들웨어 등록
httpApp.use(helmet());
httpApp.use(cors({ origin: '*' }));
httpApp.use(json());
httpApp.use(bodyParser());
httpApp.use(logger());
// httpApp.use(authJwt);
httpApp.use(routerV1.routes());
httpApp.use(routerV1.allowedMethods());

server.listen(port, () => {
  const message = `[SSTM] Runninus_backend listening on the port ${port}`;
  const wrapCharacter = '@'.repeat(message.length);

  Logger.info(wrapCharacter);
  Logger.info(message);
  Logger.info(wrapCharacter);
});

webSocketApp.use(httpApp);
