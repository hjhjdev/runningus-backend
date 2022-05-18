import koa from 'koa';
import { Server } from 'socket.io';
import { Server as http } from 'http';
import { authSocket } from '@middlewares/authSocket.middleware';
import Database from '@libraries/database.lib';
import { Logger } from '@utilities/winston-logger.util';
import {
  addUserMeetLog,
  addUserToMeetList,
  findMeetByMeetUid,
  findMeetUsers,
  removeUserFromMeetList,
} from '@assets/query';
import { FindRoombyRoomUidReturn } from 'types/model';

class SocketServer {
  private io: Server;

  constructor(httpServer: http) {
    this.io = new Server(httpServer /* , { cors: { credentials: true } } */);
  }

  use(httpApp: koa) {
    // socket.io 인스턴스를 koa 의 context에 주입
    // https://github.com/koajs/koa/blob/master/docs/api/index.md#appcontext
    // eslint-disable-next-line no-param-reassign
    httpApp.context.io = this.io;

    // 소켓 인증 관련 미들웨어 주입
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    // this.io.use(authSocket);

    // put individual socket into room
    this.io.on('connection', (socket) => {
      const connection = {
        userUid: '-1',
        meetId: '-1',
      };

      //   // 방 uid 로 join
      //   socket.join(user.id);
      //   Logger.info(`[SOKT] [JOIN] room ${user.id}, username ${user.username}`);

      // handle toggle event
      socket.on('MEET_IN', async ({ userUid, meetId }: { userUid: string; meetId: string }) => {
        // 방 입장 시 userUid 저장
        // 퇴장 시 사용
        connection.userUid = userUid;

        // 방 아이디로 입장
        const [result] = await Database.query<FindRoombyRoomUidReturn[]>(findMeetByMeetUid, [meetId]);

        if (!result) socket.emit('MEET NOT FOUND');
        else {
          const { STATE, MAX_NUM } = result;
          const findMeetResult = await Database.query<Array<{ USER_ID: string }>>(findMeetUsers, [meetId]);

          if (!STATE) socket.emit('MEET STATUS NOT WAITING(00)');
          if (MAX_NUM === findMeetResult.length) socket.emit('MEET FULL');
          else {
            socket.join(meetId);

            // 미팅 참여 기록 및 현재 방 참여 상태 확인
            await Database.query(addUserMeetLog, [meetId, userUid, '00', new Date()]);
            await Database.query(addUserToMeetList, [meetId, userUid, new Date()]);
          }
        }
      });

      socket.on('ROOM_OUT', async () => {
        const { meetId, userUid } = connection;

        await Database.query(addUserMeetLog, [meetId, userUid, '80', new Date()]);
        await Database.query(removeUserFromMeetList, [meetId, userUid]);
      });

      socket.on('ROOM_REFRESH', () => {});

      socket.on('ROOM_UPDATE', () => {});

      // 에러 처리
      socket.on('error', (reason) => {
        Logger.info('[SOKT] [EROR] event: %o', reason);
      });

      // 연결 해제 처리
      socket.on('disconnect', (resason) => {
        const { userUid } = connection;
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Logger.info(`[SOKT] [EXIT] user uid ${userUid} disconnected by ${resason}`);
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
