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
import {apiCall as api} from '@middlewares/api.middleware';



class ReqBody {
    public name = '';

    public host = '';

    public max_num = 0;

    public ex_distance = 0;

    public ex_start_time ='';
    
    public ex_end_time = '';

    public level = 0;
}


export class MeetingController {
    public static test(ctx : Context) {
        const arr = [10, 230, 0, 21];


        ctx.body = api.returnBadReqest();
    }

    public static createMeeting(ctx : Context) {
        const req = ctx.request.body;
        
        if(api.checkValidation(new ReqBody(), req) === false) {
            return ctx.body = api.returnBadReqest();
        };
        ctx.body = api.returnSuccessRequest("검증 성공");
        // console.log(reqBody);
        // const DbCheckResult = Database.query('SELECT * FROM MEET WHERE NAME = ?', reqBody.name);
        // console.log(DbCheckResult);
        // if (DbCheckResult === undefined) {
        //     ctx.throw('이름이 중복된 미팅이 있습니다.', 403)
        // }
        // Database.query('INSERT INTO MEET (NAME, HOST, MAX_NUM, EX_DISTANCE, EX_START_TIME, EX_END_TIME, LEVEL) VALUE (?, ?, ?, ? ,? ,? , ?)', [reqBody.name, reqBody.host, reqBody.max_num, ] )
        
    
    }

    public static test2(ctx : Context) {

    //     const Obj : object = {
    //         name: "him",
    //         age: 10
    //     }

    //     console.log(Object.assign(Obj, 
    //         {
    //             value :
    //                 {
    //                     school : "school",
    //                     place : 'seoul'
    //                 }
    //         }
    //     ));
    // }
    ctx.body = "dssdaf";
    }
}