import koa from 'koa';
import { Server } from 'socket.io';
import { Server as http } from 'http';
import Database from '@libraries/database.lib';
import { Logger } from '@utilities/winston-logger.util';
import {
  addUserMeetLog,
  findMeetByMeetUid,
  findMeetUsers,
  removeUserFromMeetList,
  updateMeetToStart,
  addMeetLog,
  updateMeetToEnd,
  findUsersFromHistory,
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
      socket.on('PING', () => {
        Logger.info('Client PING: %o', connection);
        socket.emit('PONG');
      });

      socket.on(
        'MEET_IN',
        async ({ userUid, meetId, isRecover }: { userUid: string; meetId: string; isRecover: boolean }) => {
          Logger.info('MEET_IN: userUid %o, meetId %o', userUid, meetId);
          // 방 입장 시 userUid 저장
          // 퇴장 시 사용
          connection.userUid = userUid;
          connection.meetId = meetId;

          // 앱이 종료 후 다시시작해 상태를 복구해야 할 경우 조용히 room join
          if (isRecover) {
            Logger.info('MEET_IN: isRecover userUid %o, meetId %o', userUid, meetId);
            return socket.join(meetId);
          }

          // 방 아이디로 입장
          const [result] = await Database.query<FindRoombyRoomUidReturn[]>(findMeetByMeetUid, [meetId]);

          if (!result) {
            Logger.info('MEET_IN: userUid %o, meetId %o, 방이 존재하지 않음', userUid, meetId);
            return socket.emit('MEET_ERROR', { reason: '방이 존재하지 않습니다' });
          }

          const { STATE, MAX_NUM } = result;
          const findMeetResult = await Database.query<Array<{ USER_ID: string }>>(findMeetUsers, [meetId]);

          if (STATE) {
            Logger.info('MEET_IN: userUid %o, meetId %o, 이미 시작한 방이거나 정지된 방입니다', userUid, meetId);
            return socket.emit('MEET_ERROR', { reason: '이미 시작한 방이거나 정지된 방입니다' });
          }

          if (MAX_NUM === findMeetResult.length) {
            Logger.info('MEET_IN: userUid %o, meetId %o, 방이 꽉 찼습니다', userUid, meetId);
            return socket.emit('MEET_ERROR', { reason: '방이 꽉 찼습니다' });
          }

          Logger.info('MEET_IN: userUid %o, meetId %o, 참여 완료', userUid, meetId);
          socket.join(meetId);

          Logger.info('Available socket meets: \n%o', socket.rooms);

          // 미팅 참여 기록 및 현재 방 참여 상태 확인
          await Database.query(addUserMeetLog, [meetId, userUid, '00', new Date()]);
          // await Database.query(addUserToMeetList, [meetId, userUid, new Date()]);

          // 접속한 클라이언트에게 입장 알림
          socket.emit('MEET_CONNECTED', { meetId });

          // 나머지 클라이언트에게 입장 알림
          return socket.to(meetId).emit('USER_IN', { userUid });
        },
      );

      socket.on('MEET_OUT', async () => {
        const { meetId, userUid } = connection;

        // 이미 나왔는데 또 나간 요청을 보낼 경우
        if (meetId === '-1') {
          Logger.info('MEET_IN: userUid %o, meetId %o, 이미 나갔거나 또 나가는 요청 보냄', userUid, meetId);
          socket.emit('MEET_ALREADY_DISCONNECTED');
        } else {
          Logger.info('MEET_IN: userUid %o, meetId %o, 퇴장 시도', userUid, meetId);

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

          Logger.info('MEET_IN: userUid %o, meetId %o, 퇴장 완료', userUid, meetId);
        }
      });

      socket.on('MEET_START', async () => {
        const { meetId } = connection;

        Logger.info('MEET_START SEND %o', meetId);

        socket.to(meetId).emit('RUNNING_START', { status: -1 });

        const date = new Date();
        const users = await Database.query<Array<{ USER_ID: string }>>(findUsersFromHistory, [meetId, 0]);
        const meetLogs = users.map((item) => [meetId, item.USER_ID, date, 30, '[Meeting 시작 - 방 운동 시작]']);

        if (meetLogs.length) await Database.query(addMeetLog, [meetLogs]);
        else Logger.info('no meetLogs in MEET_START');

        await Database.query(updateMeetToStart, [meetId]);
      });

      socket.on('MEET_END', async () => {
        const { meetId } = connection;

        Logger.info('MEET_END SEND %o', meetId);

        socket.to(meetId).emit('RUNNING_END', { status: -1 });

        const date = new Date();
        const users = await Database.query<Array<{ USER_ID: string }>>(findUsersFromHistory, [meetId, 30]);
        const meetLogs = users.map((item) => [meetId, item.USER_ID, date, 60, '[Meeting 종료 - 방 운동 끝]']);

        if (meetLogs.length) await Database.query(addMeetLog, [meetLogs]);
        else Logger.info('no meetLogs in MEET_END');

        await Database.query(updateMeetToEnd, [meetId]);
      });

      // 에러 처리
      socket.on('error', (reason: any) => {
        Logger.info('[SOKT] [EROR] event: %o', reason);
      });

      // 연결 해제 처리
      socket.on('disconnect', (resason: any) => {
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
