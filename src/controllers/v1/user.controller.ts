import Database from '@libraries/database.lib';
import { Logger } from '@utilities/winston-logger.util';
import { Context } from 'koa';

/**
 * 계정 조작 컨트롤러 모음
 */
export class UserController {
  public static handleRequest(ctx: Context) {
    const { query } = ctx;
    const { method } = query;

    // method option check
    if (!Array.isArray(method) && method) return UserController.handleOAuth(ctx, method);

    return ctx.throw(401);
  }

  public static handleOAuth(ctx: Context, method: string) {
    Logger.debug('in handleOAuth');

    const allowed = [{ name: 'kakao', redirect: 'www.naver.com' }];
    const found = allowed.find((item) => item.name === method);

    Logger.debug('%o', found);

    if (!found) ctx.throw(408, 'wow', { error: ['non supported oauth method'] });
    else ctx.redirect(found.redirect);
  }

  public static createUser(ctx: Context) {
    const db = Database.getInstance();
  }
}
