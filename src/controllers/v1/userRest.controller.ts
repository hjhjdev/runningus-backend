/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable consistent-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-return-assign */
/* eslint-disable lines-between-class-members */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Database from '@libraries/database.lib';
import { Context } from 'koa';
import { isContext } from 'vm';
import { request } from 'websocket';
import { apiCall as api } from '@middlewares/api.middleware';
import { meetList as list} from '@middlewares/meetlist.middleware';
import { Sql } from 'types/query';

class UserIdReq {
    public user_id = 0;
}

class UserAltReq {
    public user_id = 0;

    public user_nick = '';

    public user_age = 0;

    public user_sex = 0;

    public user_address = '';
}


export class UserRestController {
    // o_auth id를 뺀 USER 테이블 SELECT 선택자
    private static SelectSql : string = 'UID, NICK, AGE, SEX, BORN, DISTANCE, POINT_ADDRESS, TEXT_ADDRESS, PHONE, MANNER_POINT, POWER, POINT';

    public static test(ctx: Context) {
      ctx.body = api.returnSuccessRequest('테스트 성공');
      
    }
    
    // ===================================유저 정보 조회 api=======================================
    public static async userInq(ctx : Context) {
        // api 유효성 검사
        const req = ctx.request.body;
        if (api.checkValidation(new UserIdReq(), req) === false) {
            api.printConsole(' 유저 정보 조회 api 검증 실패');
            ctx.response.status = 400;
            return (ctx.body = api.returnBadRequest());
        }

        try {
            // 유저가 있는지 조회
            const dbResult : any = await Database.query(`SELECT ${this.SelectSql} FROM USER WHERE UID = ${req.user_id} `);
            if (dbResult[0] === undefined) {
                api.printConsole(`유저 정보 조회 실패 - userId : ${req.user_id}인 유저 존재하지 않음`);
                ctx.response.status = 403;
                return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '유저가 존재하지 않습니다.'));
            } 
            api.printConsole(`유저 정보 조회 - 유저 이름 [ ${dbResult[0].NICK} ] [ 유저 id - ${dbResult[0].UID} ]`);
            return (ctx.body = {
                ...api.returnSuccessRequest("유저 정보 조회에 성공했습니다."),
                results : dbResult
            });
        }
        catch (err : any) {
            api.printConsole(` 유저 정보 조회 DB Import 오류 : ${err}`);
            ctx.response.status = 400;
            return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
        }
    }
    // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 유저 정보 조회 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

    // ===================================유저 정보 조회 api=======================================
    public static async userUpdate(ctx:Context) {
        // api 유효성 검사
        const req = ctx.request.body;
        if (api.checkValidation(new UserAltReq(), req) === false) {
            api.printConsole(' 유저 정보 수정 api 검증 실패');
            ctx.response.status = 400;
            return (ctx.body = api.returnBadRequest());
        }

        try {
            // 유저가 있는지 조회
            const dbResult : any = await Database.query(`SELECT ${this.SelectSql} FROM USER WHERE UID = ${req.user_id} `);
            if (dbResult[0] === undefined) {
                api.printConsole(`유저 정보 수정 실패 - userId : ${req.user_id}인 유저 존재하지 않음`);
                ctx.response.status = 403;
                return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '유저가 존재하지 않습니다.'));
            }

            const sex = (req.user_sex === 0) ? 0 : 1;
            await Database.query(`UPDATE USER SET NICK = "${req.user_nick}", AGE = ${req.user_age}, SEX = ${sex}, TEXT_ADDRESS = "${req.user_address}" WHERE UID = ${req.user_id}`)
            api.printConsole(`유저 정보 수정 - 유저 이름 [ ${dbResult[0].NICK} ] [ 유저 id - ${dbResult[0].UID} ]`);
            return ctx.body = api.returnSuccessRequest("유저 정보 수정에 성공했습니다.")

        }
        catch( err : any ) {
            api.printConsole(` 유저 정보 수정 DB Import 오류 : ${err}`);
            ctx.response.status = 400;
            return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
        }
    }
    // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 유저 정보 조회 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

    // ===================================유저 초기 확인 api 시작 =======================================
    public static async userListCheck (ctx : Context) {
        // api 유효성 검사
        const req = ctx.request.body;
        if (api.checkValidation(new UserIdReq(), req) === false) {
            api.printConsole(' 유저 초기 확인 api 검증 실패');
            ctx.response.status = 400;
            return (ctx.body = api.returnBadRequest());
        }

        try{
            // 유저가 대기실에 입장해있는지 확인
            const dbResult1 : any = await Database.query(`SELECT * FROM LIST WHERE USER_ID = ${req.user_id}`);
            if (dbResult1[0] === undefined) {
                api.printConsole(`유저 초기 확인 성공 - 방 참여 여부 [ false ] [ 유저 id - ${req.user_id} ]`);
                return ctx.body = api.returnSuccessRequest202("유저 초기 확인에 성공하였습니다. 참여중인 방이 없습니다.")
            }

            const query = `
            SELECT MEET.*, USER.NICK AS HOST_NICK, 
            (SELECT COUNT(*) + 1
              FROM LIST
              WHERE MEET.UID = LIST.MEET_ID) AS NOW_NUM
            FROM MEET LEFT OUTER JOIN USER
            ON MEET.HOST = USER.UID
            WHERE MEET.UID = ${dbResult1[0].MEET_ID}`;
            const dbResult2 : any = await Database.query(query);

            // 방에 참여하고 있는 유저의 닉네임 dbResult에 assign
            for(const index in dbResult2) if (true) {
                const dbTempResult = await Database.query(
                `SELECT USER.UID, USER.NICK 
                FROM LIST LEFT OUTER JOIN USER
                ON LIST.USER_ID = USER.UID
                WHERE LIST.MEET_ID = ${dbResult2[index].UID}
                ORDER BY REG_DATE`
            );

                Object.assign(dbResult2[index], {NOW_USER_INFO : dbTempResult});
            };

            api.printConsole(`유저 초기 확인 성공 - 방 참여 여부 [ True ] [ 유저 id - ${req.user_id} ]`);
            ctx.body = Object.assign(api.returnSuccessRequest('유저 초기 확인에 성공하였습니다. 참여중인 방이 있습니다.'), { results: dbResult2 });
        } 
        catch( err : any ) {
            api.printConsole(` 유저 초기 확인 DB Import 오류 : ${err}`);
             ctx.response.status = 400;
            return (ctx.body = api.returnBasicRequest(false, ctx.response.status, err.message));
        }      
    }
    // ===================================유저 초기 확인 api 시작 =======================================

    public static async userNickReturn (ctx : Context) {
         // api 유효성 검사
        const req = ctx.request.body;
        if (api.checkValidation(new UserIdReq(), req) === false) {
            api.printConsole(' 유저 초기 확인 api 검증 실패');
            ctx.response.status = 400;
            return (ctx.body = api.returnBadRequest());
        }

        // 유저가 있는지 확인
        const dbResult : any = await Database.query(`SELECT NICK FROM USER WHERE UID = ${req.user_id}`);
        if(dbResult[0] === undefined) {
            api.printConsole(`유저 닉네임 리턴 실패 - userId : ${req.user_id}인 유저 존재하지 않음`);
            ctx.response.status = 403;
            return (ctx.body = api.returnBasicRequest(false, ctx.response.status, '유저가 존재하지 않습니다.'));
        }

        // 닉네임 반환
        api.printConsole(`유저 닉네임 리턴 성공 - [ 유저 id - ${req.user_id} ] [ 유저 닉네임 - ${dbResult[0].NICK}]`);
        ctx.body = Object.assign(api.returnSuccessRequest('유저 닉네임 리턴에 성공했습니다.'), {results: dbResult[0]});
    }

    // +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+= 유저 초기 확인 api 끝 +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=

}