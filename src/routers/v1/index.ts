import Router from 'koa-router';
import { nonAuthRouter } from '@routers/v1/account.router';
import { MeetingRouter } from '@routers/v1/meeting.router';
import { UserRestRouter } from '@routers/v1/userRest.router'
import { AuthJwtContext } from 'types/jwt';
import { Context } from 'koa';

const router = new Router<Record<string, never>, Context>({ prefix: '/v1' });

router.use(nonAuthRouter.routes());
router.use(MeetingRouter.routes());
router.use(UserRestRouter.routes());

export default router;
