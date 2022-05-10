import Router from 'koa-router';
import { MeetingController } from '@controllers/v1/meet.controller';

const MeetingRouter = new Router();

MeetingRouter.get('/test', (ctx) => MeetingController.test(ctx));
MeetingRouter.get('/meet/create', (ctx) => MeetingController.createMeeting(ctx));
MeetingRouter.get('/test2', (ctx) => MeetingController.test2(ctx));

export { MeetingRouter };