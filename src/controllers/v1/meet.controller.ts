/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable consistent-return */
/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Database from '@libraries/database.lib';
import { Context } from 'koa';
import { isContext } from 'vm';
import { request } from 'websocket';
import { apiCall as api } from '@middlewares/api.middleware';
import { meetList as list} from '@middlewares/meetlist.middleware';
import { Sql } from 'types/query';

class MeetCreateReq {
  public name = '';

  public host = 0;

  public point_x = 0;

  public point_y = 0;

  public max_num = 0;

  public ex_distance = 0;

  public ex_start_time = '';

  public ex_end_time = '';

  public level = 0;
}

class MeetSearchReq {
  public point_x = 0;

  public point_y = 0;
}

class MeetJoinReq {
  public user_id = 0;

  public meet_id = 0;
}

class MeetStartReq {
  public meet_id = 0;
}

class MeetEndReq {
  public meet_id = 0;
}


export class MeetingController {
  public static test(ctx: Context) {
    ctx.body = api.returnSuccessRequest('테스트 성공');
  }

  // ===================================미팅 생성 api=======================================

  public static async createMeeting(ctx: Context) {
    // api 유효성 검사
    const req = ctx.request.body;
    if (api.checkValidation(new MeetCreateReq(), req) === false) {
      api.printConsole(' Meet Create api 검증 실패');
      ctx.response.status = 400;
      return (ctx.body = api.returnBadRequest());
    }

    // 중복된 미팅 이름 검사
    const DbCheckResult: any = await Database.query('SELECT * FROM MEET WHERE NAME = ?', req.name);
    if (DbCheckResult[0] !== undefined) {
      api.printConsole(' Meet Create api 이름 중복 오류');
      ctx.response.status = 403;
      return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '이미 이름이 존재하는 미팅입니다.'));
    }

    // MEET 테이블 INSERT
    try {
      const point = `POINT(${req.point_y}, ${req.point_x})`;
      await Database.query(
        `INSERT INTO MEET (NAME, HOST, POINT, MAX_NUM, EX_DISTANCE, EX_START_TIME, EX_END_TIME, LEVEL) VALUE (?, ?, ${point}, ?, ?, ?, ?, ?)`,
        [req.name, req.host, req.max_num, req.ex_distance, req.ex_start_time, req.ex_end_time, req.level],
      );
      api.printConsole(' Meet Create api 미팅 생성 성공');
      return (ctx.body = api.returnSuccessRequest('미팅 생성에 성공하였습니다.'));
    } catch (err: any) {
      // API 입력시 Datetime 형식을 따르지 않을 경우 오류
      api.printConsole(' Meet Create api DB Insert 오류');
      ctx.response.status = 400;
      return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
    }
  }

  // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 미팅 생성 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

  // ===================================미팅 조회 api=======================================
  public static async searchMeeting(ctx: Context) {
    // api 유효성 검사
    const req = ctx.request.body;
    if (api.checkValidation(new MeetSearchReq(), req) === false) {
      api.printConsole(' Meet Search api 검증 실패');
      ctx.response.status = 400;
      return (ctx.body = api.returnBadRequest());
    }

    // MEET 테이블을 입력받은 거리 내로 조회
    try {
        // const MAX_DISTANCE = 5000,
        // const LIMIT = 10
        const point = `POINT(${req.point_y}, ${req.point_x})`;

        const dbResult = await Database.query(
            `SELECT *, ST_DISTANCE_SPHERE(${point}, POINT) AS DIST,
              (SELECT COUNT(*)
              FROM LIST
              WHERE MEET.UID = LIST.MEET_ID) AS NOW_NUM
            FROM MEET
            WHERE STATE = ${process.env.STATUS_INIT}
            ORDER BY DIST`
            // WHERE st_distance_sphere(Point(127.1210368, 37.3817369), point) < ${MAX_DISTANCE}
            // LIMIT ${LIMIT}
      );

      api.printConsole(' Meet Search 성공');
      ctx.body = Object.assign(api.returnSuccessRequest('미팅 조회에 성공하였습니다.'), { results: dbResult });
    } catch (err: any) {
      // DB Insertion 오류
      api.printConsole(' Meet Search api DB Insert 오류');
      ctx.response.status = 400;
      return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
    }
  }
  // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 미팅 조회 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

  // ===================================미팅 참여 api=======================================
  public static async joinMeeting(ctx: Context) {
    // api 유효성 검사
    const req = ctx.request.body;
    if (api.checkValidation(new MeetJoinReq(), req) === false) {
      api.printConsole('Meet Join api 검증 실패');
      ctx.response.status = 400;
      return (ctx.body = api.returnBadRequest());
    }

    try {
        // MEET이 존재하는지 검사
        const dbResult1 : any = await Database.query(`
        SELECT * ,
        (SELECT COUNT(*) + 1
          FROM LIST
          WHERE MEET.UID = LIST.MEET_ID) AS NOW_NUM
        FROM MEET
        WHERE UID = ${req.meet_id}`);
        if (dbResult1[0] === undefined) {
          api.printConsole('Meet Join 실패 - 미팅이 존재하지 않습니다.');
          ctx.response.status = 403;
          return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '미팅이 존재하지 않습니다.'));
        } 
        // MEET 대기상태 검사
        if (dbResult1[0].STATE !== parseInt(process.env.STATUS_INIT, 10) ) {
          api.printConsole(`Meet Join 실패 - 대기실 참여 실패 [Meeting State Code : ${dbResult1[0].STATE}]`);
          ctx.response.status = 403;
          return (ctx.body = api.returnBasicRequest(false, ctx.response.status, `대기실 참여 실패 [code : ${dbResult1[0].STATE}]`));
        }

        // LIST에 값이 있는지 검사
        const dbResult2 : any = await Database.query(`SELECT UID FROM LIST WHERE MEET_ID = ${req.meet_id} AND USER_ID = ${req.user_id} `);
        if (dbResult2[0] !== undefined) {
            api.printConsole('Meet Join 실패 - 이미 존재하는 릴레이션 입니다.');
            ctx.response.status = 403;
            return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '이미 존재하는 릴레이션 입니다.'));
        }

        // 대기 인원 초과 확인
        const ckMax = await list.checkMax ( dbResult1[0].UID , dbResult1[0].MAX_NUM );
        if (ckMax === true) {
          api.printConsole('Meet Join 실패 - 대기 인원이 초과하였습니다.');
          ctx.response.status = 403;
          return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '대기 인원이 초과하여 입장할 수 없습니다.'));
        }

        // 성공 후 list, meetlog에 값 입력
        await Database.query(`INSERT INTO LIST (MEET_ID, USER_ID) VALUE (${req.meet_id}, ${req.user_id})`);
        await Database.query(`INSERT INTO MEETLOG (MEET_ID, USER_ID, CODE, CONTENT) VALUE (${req.user_id}, ${req.meet_id}, 00, '[Meeting 조인]')`,);
        api.printConsole(' Meet Join 성공');
        return (ctx.body = {
          ...api.returnSuccessRequest("미팅 참여에 성공했습니다."),
          results : dbResult1
        });
    } catch (err: any) {
        api.printConsole(' Meet join api DB Insert 오류');
        ctx.response.status = 400;
        return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
    }
  }
    // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 미팅 참여 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=


    // ===================================미팅 퇴장 api=======================================
    public static async quitMeeting(ctx: Context) {
        // api 유효성 검사
        const req = ctx.request.body;
        if (api.checkValidation(new MeetJoinReq(), req) === false) {
            api.printConsole(' Meet quit api 검증 실패');
            ctx.response.status = 400;
            return (ctx.body = api.returnBadRequest());
        }
    
        try {
            // LIST에 값이 있는지 검사
            const dbResult : any = await Database.query(`SELECT UID FROM LIST WHERE MEET_ID = ${req.meet_id} AND USER_ID = ${req.user_id} `);
            console.log(dbResult);
            if (dbResult[0] === undefined) {
                api.printConsole('Meet Quit 실패 - 해당 미팅에 사용자가 존재하지 않습니다.');
                ctx.response.status = 403;
                return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '존재하지 않는 참여 릴레이션 입니다.'));
            }

            await Database.query(`DELETE FROM LIST WHERE MEET_ID = ${req.meet_id} AND USER_ID = ${req.user_id}`);
            await Database.query(`INSERT INTO MEETLOG (MEET_ID, USER_ID, CODE, CONTENT) VALUE (${req.meet_id}, ${req.user_id}, 00, '[Meeting 퇴장]')`);
            api.printConsole('Meet quit 성공');
            return (ctx.body = api.returnSuccessRequest('미팅 퇴장에 성공하였습니다.'));
        } catch (err: any) {
            api.printConsole(' Meet quit api DB Insert 오류');
            ctx.response.status = 400;
            return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
        }
    }

  // ===================================운동 시작 api=======================================
  public static async startMeeting(ctx : Context) {
      // api 유효성 검사
    const req = ctx.request.body;
    if (api.checkValidation(new MeetStartReq(), req) === false) {
      api.printConsole(' Meet start api 검증 실패');
      ctx.response.status = 400;
      return (ctx.body = api.returnBadRequest());
    }

    try {
      // 운동이 이미 시작되었는지 검사
      const dbResult : any = await Database.query(`SELECT UID, STATE FROM MEET WHERE UID = ${req.meet_id}`);
      if(dbResult[0].STATE >= parseInt(process.env.STATUS_SUCCESS, 10) ) {
        api.printConsole(`Meet start api 실행 실패 [uid = ${dbResult[0].UID}]) - 운동 실행 거절`);
        ctx.response.status = 400
        return (ctx.body = api.returnBasicRequest(false, ctx.response.status, `운동 실행이 거절되었습니다. 미팅 상태 코드 : ${dbResult[0].STATE}`));
      }
      
      await Database.query(`UPDATE MEET SET STATE = ${process.env.STATUS_SUCCESS} WHERE UID = ${req.meet_id}`);
      api.printConsole(`Meet uid : [${dbResult[0].UID}] start 성공`);
      return (ctx.body = api.returnSuccessRequest('운동 시작에 성공하였습니다.'));
    }
    catch (err: any) {
      api.printConsole(' Meet start api DB Insert 오류'); 
      ctx.response.status = 400;
      return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
    }
  }
  // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 운동 시작 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

  // ===================================운동 종료 api========================================
  // public static async endMeeting(ctx : Content) {
  //     // api 유효성 검사
  //     const req = ctx.request.body;
  //     if (api.checkValidation(new MeetEndReq(), req) === false) {
  //       api.printConsole(' Meet quit api 검증 실패');
  //       ctx.response.status = 400;
  //       return (ctx.body = api.returnBadReqest());
  //     }
  // }

  // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 운동 종료 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

  public static async test2(ctx: Context) {
    const result: any = await Database.query('SELECT POINT FROM MEET WHERE UID = 15');
    console.log(result[0]);
    ctx.body = 'dssdaf';
  }
}
