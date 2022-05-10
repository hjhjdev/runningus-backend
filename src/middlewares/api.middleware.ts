/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-restricted-syntax */
export class apiCall {
    public static ckType(base : any, target : any) : boolean {
        if (typeof base === typeof target)
            return true;
        return false; 
    }

    public static checkValidation(base : any, target : any) : boolean{
        for (const key in base) if (true) {
            if (target[key] === undefined || this.ckType(base[key], target[key])===false) return false;
        }
        return true;
    }

    public static returnBasicRequest (isSuccess : boolean, code : number, message : string ) : object {
        const result =
        {
            "isSuccess" : isSuccess,
            "code":code,
            "message":message
        }
        return result;
    }

    public static returnSuccessRequest (message : string) : object {
        const result =
        {
            "isSuccess" : true,
            "code":200,
            "message":message
        }
        return result;
    }
    
    public static returnBadReqest () : object {
        const result =
        {
            "isSuccess" : false,
            "code":400,
            "message":"잘못된 요청입니다. api 명세서를 확인하세요."
        }
        return result;
    }
}
