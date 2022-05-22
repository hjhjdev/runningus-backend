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

    Logger.info('Socket initialized');
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

      // 연결 시 TEST emit
      socket.emit('TEST');

      // 하트비트 요청
      socket.on('PING', () => socket.emit('PONG'));

      socket.on('MEET_IN', async ({ userUid, meetId }: { userUid: string; meetId: string }) => {
        // 방 입장 시 userUid 저장
        // 퇴장 시 사용
        connection.userUid = userUid;
        connection.meetId = meetId;

        // 방 아이디로 입장
        const [result] = await Database.query<FindRoombyRoomUidReturn[]>(findMeetByMeetUid, [meetId]);

        if (!result) socket.emit('MEET_ERROR', { reason: '방이 존재하지 않습니다' });
        else {
          const { STATE, MAX_NUM } = result;
          const findMeetResult = await Database.query<Array<{ USER_ID: string }>>(findMeetUsers, [meetId]);

          if (!STATE) socket.emit('MEET_ERROR', { reason: '이미 시작한 방이거나 정지된 방입니다' });
          if (MAX_NUM === findMeetResult.length) socket.emit('MEET_ERROR', { reason: '방이 꽉 찼습니다' });
          else {
            socket.join(meetId);

            // 미팅 참여 기록 및 현재 방 참여 상태 확인
            await Database.query(addUserMeetLog, [meetId, userUid, '00', new Date()]);
            await Database.query(addUserToMeetList, [meetId, userUid, new Date()]);

            // 접속한 클라이언트에게 입장 알림
            socket.emit('MEET_CONNECTED', { meetId });

            // 나머지 클라이언트에게 입장 알림
            socket.to(meetId).emit('USER_IN', { userUid });
          }
        }
      });

      socket.on('MEET_OUT', async () => {
        const { meetId, userUid } = connection;

        // 이미 나왔는데 또 나간 요청을 보낼 경우
        if (meetId === '-1') socket.emit('MEET_ALREADY_DISCONNECTED');

        // 퇴장
        socket.leave(meetId);

        await Database.query(addUserMeetLog, [meetId, userUid, '80', new Date()]);
        await Database.query(removeUserFromMeetList, [meetId, userUid]);

        // 퇴장 알림
        socket.emit('MEET_DISCONNECTED', { meetId });

        // 나머지 클라이언트에게 퇴장 알림
        socket.to(meetId).emit('USER_OUT', { userUid });

        // 접속한 meetId 초기화
        connection.meetId = '-1';
      });

      // 에러 처리
      socket.on('error', (reason: unknown) => {
        Logger.info('[SOKT] [EROR] event: %o', reason);
      });

      // 연결 해제 처리
      socket.on('disconnect', (resason: unknown) => {
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
