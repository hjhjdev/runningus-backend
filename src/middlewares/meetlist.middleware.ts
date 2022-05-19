/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import Database from "@libraries/database.lib";
import { AnyRecord } from "dns";

export class meetList {
    // 입력받은 id의 미팅의 초과인원이 다 됐는지 파라미터를 받아서 확인하는 함수
    // await을 붙여서 사용할 것
    public static async checkMax (uid : number, max : number){
        const dbResult : any = await Database.query(`SELECT COUNT(*) AS CNT FROM LIST WHERE MEET_ID = ${uid}`);
        if (dbResult[0] === undefined){
            return undefined;
        }
        console.log(typeof(dbResult[0].CNT));
        if ( parseInt(dbResult[0].CNT, 10) >= max) return true;
        return false;
    }

    // public static async returnUsernameById(uid : number) {
    //     const dbResult = Database.query('SELECT')
    // }
}