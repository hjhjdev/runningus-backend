import { Sql } from 'types/query';

export const testQuery: Sql = `
  SELECT 
    *
  FROM
    ${process.env.USER_TABLE};
`;

export const findOauthId: Sql = `
  SELECT
    UID
  FROM
    ${process.env.USER_TABLE} AS U
  WHERE
    U.OAUTH_ID = ?;
`;

export const insertInitialUser: Sql = `
  INSERT INTO
    ${process.env.USER_TABLE} (OAUTH_ID)
  VALUES (?)
`;

export const insertUserRefreshToken: Sql = `
  INSERT INTO
    ${process.env.USER_AUTH_TABLE} (USER_UID, REFRESH_TOKEN)
  VALUES (?, ?)
`;

export const findUserRefreshTokenByRefreshToken: Sql = `
  SELECT
    USER_UID, REFRESH_TOKEN
  FROM
    ${process.env.USER_AUTH_TABLE} AS UA
  WHERE
    UA.REFRESH_TOKEN = ?
`;
