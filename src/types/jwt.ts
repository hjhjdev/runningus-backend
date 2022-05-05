import Jwt from 'jsonwebtoken';
import { Context } from 'koa';

export interface AuthJwtPayload extends Jwt.JwtPayload {
  hash: string;
  uuid: string;
  id: string;
}

export interface AuthJwtContext extends Context {
  clientId: number;
  uuid: string;
  body: any;
}
