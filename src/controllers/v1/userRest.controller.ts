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

class UserInq {
    public user_id = 0;
}

export class UserRestController {
    // o_auth id를 뺀 USER 테이블 SELECT 선택자
    private static SelectSql : string = 'UID, NICK, SEX, BORN, DISTANCE, POINT_ADDRESS, TEXT_ADDRESS, PHONE, MANNER_POINT, POWER, POINT';

    public static test(ctx: Context) {
      ctx.body = api.returnSuccessRequest('테스트 성공');
      
    }
    
    // // ===================================유저 정보 조회 api=======================================
    public static async userInq(ctx : Context) {
        const req = ctx.request.body;
        if (api.checkValidation(new UserInq(), req) === false) {
            api.printConsole(' 유저 정보 조회 api 검증 실패');
            ctx.response.status = 400;
            return (ctx.body = api.returnBadRequest());
        }

        try {
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

}