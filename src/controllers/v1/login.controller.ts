import Database from '@libraries/database.lib';
import { Logger } from '@utilities/winston-logger.util';
import { Context } from 'koa';

/**
 * 계정 조작 컨트롤러 모음
 */
export class LoginController {
  public static redirectLogin(ctx: Context) {
    // Logger.debug('in redirectLogin');

    // const { query } = ctx;
    // const { method } = query;

    const allowed = [
      {
        name: 'kakao',
        // eslint-disable-next-line max-len
        redirect: [
          'https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=',
          process.env.REST_API_KEY,
          '&redirect_uri=',
          process.env.REDIRECT_HOST,
          '/v1/',
        ].join(''),
      },
    ];

    const found = allowed.find((item) => item.name === method);

    // Logger.debug('%o', found);

    // if (!found) return ctx.throw(401, 'wow', { error: ['Non supported OAuth method'] });

    // return ctx.redirect(found.redirect);
  }
}
