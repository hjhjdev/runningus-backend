/* eslint-disable @typescript-eslint/no-unsafe-call */
import Router from 'koa-router';
import { MeetingController } from '@controllers/v1/meet.controller';

const MeetingRouter = new Router();

MeetingRouter.post('/test', (ctx) => MeetingController.test(ctx));
MeetingRouter.post('/meet/create', (ctx) => MeetingController.createMeeting(ctx));
MeetingRouter.post('/test2', (ctx) => MeetingController.test2(ctx));
MeetingRouter.post('/meet/search', (ctx) => MeetingController.searchMeeting(ctx));
MeetingRouter.post('/meet/join', (ctx) => MeetingController.joinMeeting(ctx));
MeetingRouter.post('/meet/quit', (ctx) => MeetingController.quitMeeting(ctx));
MeetingRouter.post('/meet/start', (ctx) => MeetingController.startMeeting(ctx));
MeetingRouter.post('/meet/user', (ctx) => MeetingController.searchOnMeetingUser(ctx));



export { MeetingRouter };