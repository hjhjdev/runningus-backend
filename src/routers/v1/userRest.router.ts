/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Router from 'koa-router';
import { UserRestController } from '@controllers/v1/userRest.controller';

const UserRestRouter = new Router();

UserRestRouter.post('/user/inquire', (ctx) => UserRestController.userInq(ctx));
UserRestRouter.post('/user/update', (ctx) => UserRestController.userUpdate(ctx));
UserRestRouter.post('/user/check', (ctx) => UserRestController.userListCheck(ctx));
UserRestRouter.post('/user/nick', (ctx) => UserRestController.userNickReturn(ctx));

export { UserRestRouter };