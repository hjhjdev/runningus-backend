import Router from 'koa-router';
import { UserController, LoginController } from '@controllers/v1';
// import { AuthJwtContext } from 'types/jwt';

// const authRouter = new Router<Record<string, never>, AuthJwtContext>();
const nonAuthRouter = new Router();

// 소셜 로그인(회원가입)
nonAuthRouter.get('/login/kakao', (ctx) => LoginController.handleKakaoLogin(ctx));
nonAuthRouter.get('/redirect/kakao', (ctx) => LoginController.handleRedirectKakaoLogin(ctx));

// 유저 생성 및 찾기
nonAuthRouter.post('/users', (ctx) => UserController.createUser(ctx));

export { nonAuthRouter };
