import koa from 'koa';
import { Server } from 'socket.io';
import { Server as http } from 'http';
import { authSocket } from '@middlewares/authSocket.middleware';
import Database from '@libraries/database.lib';
import { Logger } from '@utilities/winston-logger.util';

class SocketServer {
  private io: Server;

  constructor(httpServer: http) {
    this.io = new Server(httpServer /* , { cors: { credentials: true } } */);
  }

  async use(httpApp: koa) {
    // socket.io 인스턴스를 koa 의 context에 주입
    // https://github.com/koajs/koa/blob/master/docs/api/index.md#appcontext
    // eslint-disable-next-line no-param-reassign
    httpApp.context.io = this.io;

    // 소켓 인증 관련 미들웨어 주입
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.io.use(authSocket);

    // put individual socket into room
    this.io.on('connection', async (socket) => {
      const { uid } = socket.data;

      //   // 방 uid 로 join
      //   socket.join(user.id);
      //   Logger.info(`[SOKT] [JOIN] room ${user.id}, username ${user.username}`);

      // handle toggle event
      socket.on('ROOM_IN', () => {});

      socket.on('ROOM_OUT', () => {});

      socket.on('ROOM_REFRESH', () => {});

      socket.on('ROOM_UPDATE', () => {});

      // 에러 처리
      socket.on('error', (reason) => {
        Logger.info('[SOKT] [EROR] event: %o', reason);
      });

      // 연결 해제 처리
      socket.on('disconnect', (resason) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Logger.info(`[SOKT] [EXIT] user uid ${uid} at ${resason}`);
      });

      //   // get user running Info
      //   const userInfo = await getIsRunning(user.id);

      //   if (!userInfo.ok) {
      //     Logger.info(`[SOKT] [EROR] ${userInfo.error?.message}`);
      //   } else {
      //     // send isRunning status to user
      //     this.io.to(user.id).emit('USER_RUN_INFO', userInfo);
      //   }
    });
  }
}

export { SocketServer };
