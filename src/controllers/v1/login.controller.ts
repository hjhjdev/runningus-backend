import { findOauthId, insertInitialUser } from '@assets/query';
import Database from '@libraries/database.lib';
import { Logger } from '@utilities/winston-logger.util';
import { Context } from 'koa';
import fetch from 'node-fetch';
import { KakaoRedirectResponse } from 'types/login';
import { findOauthIdReturn } from 'types/model';
import { apiCall as api } from '@middlewares/api.middleware';
import { OkPacket } from 'mysql2';

/**
 * 계정 조작 컨트롤러 모음
 */
export class LoginController {
  public static handleKakaoLogin(ctx: Context) {
    Logger.debug('in redirectLogin');

    const url = [
      'https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=',
      process.env.JOOON_REST_API_KEY,
      //process.env.REST_API_KEY,
      '&redirect_uri=',
      process.env.JOOON_REDIRECT_URI,
      //process.env.REDIRECT_URI,
      '/v1/redirect/kakao',
    ].join('');

    return ctx.redirect(url);
  }

  public static async handleRedirectKakaoLogin(ctx: Context) {
    Logger.debug('in handleKakaoLogin');

    const { query } = ctx;
    const { code } = query;

    // 쿼리 타입 체크
    if (typeof code !== 'string') return api.returnBadRequest();

    Logger.debug('[code]');
    Logger.debug(code);

    // 카카오 인증 서버 쿼리
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      //client_id: process.env.REST_API_KEY,
      client_id: process.env.JOOON_REST_API_KEY,
      //redirect_uri: [process.env.REDIRECT_URI, '/v1/redirect/kakao'].join(''),
      redirect_uri: [process.env.JOOON_REDIRECT_URI, '/v1/redirect/kakao'].join(''),
      code,
    });

    Logger.debug(body);

    // id_token 요청
    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'post',
      body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    // eslint-disable-next-line camelcase
    const { id_token: idToken } = (await response.json()) as KakaoRedirectResponse;

    Logger.debug('user id_token exists in db: %o', typeof idToken !== 'undefined');

    // id_token 유무 체크
    if (!idToken) return ctx.throw(500);

    // id_token(db: OAUTH_ID) 존재 여부 체크
    const foundOuthId = await Database.query<findOauthIdReturn[]>(findOauthId, [idToken]);

    // 있다면 중복 가입
    if (foundOuthId.length > 0) return api.returnBasicRequest(false, 400, '중복된 가입입니다.');

    // 없다면 먼저 DB 에 OAUTH_ID 로 가입
    const { insertId } = await Database.query<OkPacket>(insertInitialUser, [idToken]);

    // eslint-disable-next-line no-return-assign
    return (ctx.body = {
        ...api.returnSuccessRequest('로그인을 계속 진행 하세요.'),
        results: {
        uid: insertId,
      },
    });
  }
}
