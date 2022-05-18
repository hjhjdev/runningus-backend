import jwt from 'jsonwebtoken';
import { JwtPayload } from 'types/auth';
import { UserRefreshTokenFindReturn } from 'types/model';
import Database from '@libraries/database.lib';
import { findUserRefreshTokenByRefreshToken, insertUserRefreshToken } from '@assets/query';
import { Logger } from './winston-logger.util';

// 유저 정보를 받아 사인된 토큰 리턴
export function getAccessToken(userUid: string): string {
  // create payload from user
  const payload: JwtPayload = {
    uid: userUid,
  };

  // 토큰 사인
  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '2h',
  });
}

export function getRefreshToken(): string {
  // 페이로드 없이 토큰을 사인함
  return jwt.sign({}, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
}

// 토큰 검증
export function verifyToken(token: string) {
  try {
    jwt.verify(token, process.env.JWT_SECRET);

    return true;
  } catch (error) {
    return false;
  }
}

export async function saveRefreshToken(userUid: string, token: string) {
  return Database.query(insertUserRefreshToken, [userUid, token]);
}

export async function verifyRefreshToken(userUid: string, refreshToken: string) {
  try {
    // DB 에서 refreshToken 이 존재하는지 체크
    const result = await Database.query<UserRefreshTokenFindReturn[]>(findUserRefreshTokenByRefreshToken, [
      refreshToken,
    ]);

    // 검색된 결과가 있는지 1차 체크
    if (!result.length) return { alive: false, reason: 'not found' };

    // 검색된 결과에서 유저 UID 가 일치하는지 확인
    const found = result.find((item) => item.USER_UID === userUid);

    if (!found) return { alive: false, reason: 'not found' };

    try {
      jwt.verify(refreshToken, process.env.JWT_SECRET);

      return { alive: true, uid: found.USER_UID };
    } catch (error) {
      // 인증 실패
      return { alive: false, reason: 'verify failed' };
    }
  } catch (error) {
    Logger.info(error);

    // jwt error
    return { alive: false, reason: 'unresolved jwt error' };
  }
}
