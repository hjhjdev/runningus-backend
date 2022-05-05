import Router from 'koa-router';
import { UserController, LoginController } from '@controllers/v1';
// import { AuthJwtContext } from 'types/jwt';

// const authRouter = new Router<Record<string, never>, AuthJwtContext>();
const nonAuthRouter = new Router();

// user related
nonAuthRouter.post('/users', (ctx) => UserController.createUser(ctx));
nonAuthRouter.get('/users', (ctx) => UserController.handleRequest(ctx));

// login related
nonAuthRouter.get('/login', (ctx) => LoginController.redirectLogin(ctx));

export { nonAuthRouter };
