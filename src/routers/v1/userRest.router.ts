/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Router from 'koa-router';
import { UserRestController } from '@controllers/v1/userRest.controller';

const UserRestRouter = new Router();

UserRestRouter.post('/user/inquire', (ctx) => UserRestController.userInq(ctx));

export { UserRestRouter };