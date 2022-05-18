import jwt from 'jsonwebtoken';
import { ExtendedError } from 'socket.io/dist/namespace';
import { Socket } from 'socket.io';
import { serialize, parse } from 'cookie';
import { SocketError } from '@utilities/error.util';
import { Logger } from '@utilities/winston-logger.util';
import {
  verifyToken,
  verifyRefreshToken,
  getAccessToken,
  getRefreshToken,
  saveRefreshToken,
} from '@utilities/jwt.util';
import { JwtPayload } from 'types/auth';

// 소켓 인증 핸들러
export async function authSocket(socket: Socket, next: (err?: ExtendedError | undefined) => void) {
  Logger.info(`[AUTH] [SOKT] url: ${socket.handshake.url}`);

  const { headers } = socket.handshake;

  if (!headers.cookie) {
    next(new SocketError('[AUTH] [SOKT] no cookies are set in header'));
    return;
  }

  const { refreshToken, accessToken } = parse(headers.cookie);

  // 토큰이 존재하는지 확인
  if (!refreshToken || !accessToken) {
    next(new SocketError('AccessToken or refreshToken are not set in header', { type: 'NO_TOKENS' }));
    return;
  }

  const user = jwt.decode(accessToken) as JwtPayload;
  const isAccessAlive = verifyToken(accessToken);
  const isRefreshAlive = await verifyRefreshToken(refreshToken, user.uid);

  // 소켓에 유저 데이터 저장
  // eslint-disable-next-line no-param-reassign
  socket.data.user = { uid: user.uid };

  // 액세스토큰 혹은 리프레시토큰 둘 다 살아있음
  if (isAccessAlive && isRefreshAlive) {
    Logger.info(`[AUTH] [SOKT] id: ${user.uid}, all tokens alive`);
    next();
    // 액세스토큰 만료, 리프레시토큰 살아있음
    // 새 토큰 발급
  } else if (!isAccessAlive && isRefreshAlive) {
    Logger.info(`[AUTH] [SOKT] id: ${user.uid}, refresh token alive`);
    const newAccessToken = getAccessToken(user.uid);

    headers['set-cookie'] = [
      serialize('accessToken', newAccessToken, {
        httpOnly: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 10000,
      }),
    ];
  } else if (isAccessAlive && !isRefreshAlive) {
    // access alive, refresh expired
    // set new refresh
    Logger.info(`[AUTH] [SOKT] id: ${user.uid}, access token alive, refresh token expired`);
    const newRefreshToken = getRefreshToken();

    headers['set-cookie'] = [
      serialize('accessToken', newRefreshToken, {
        httpOnly: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 10000,
      }),
    ];

    // save new refresh token
    saveRefreshToken(user.uid, newRefreshToken).catch((error) => {
      Logger.error(error);

      next(new SocketError('Database error while saving new refreshToken', { type: 'DB_ERROR' }));
    });
  } else {
    Logger.info(`[AUTH] [SOKT] id: ${user.uid}, all tokens expired`);

    next(new SocketError('not authorized', { type: 'TOKEN_EXPIRED' }));
  }
}
