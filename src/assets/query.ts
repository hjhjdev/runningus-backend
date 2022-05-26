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

export const findMeetByMeetUid: Sql = `
  SELECT
    STATE, MAX_NUM
  FROM
    ${process.env.MEET_TABLE} AS MT
  WHERE
    MT.UID = ?

`;

export const addUserMeetLog: Sql = `
  INSERT INTO
    ${process.env.MEET_HISTORY_TABLE} (MEET_ID, USER_ID, CODE, DATE)
  VALUES
    (?, ?, ?, ?)
`;

export const addUserToMeetList: Sql = `
  INSERT INTO
    ${process.env.LIST_TABLE} (MEET_ID, USER_ID, REG_DATE)
  VALUES
    (?, ?, ?)
`;

export const findMeetUsers: Sql = `
  SELECT
    USER_ID
  FROM
    ${process.env.LIST_TABLE} AS MLT
  WHERE
    MLT.MEET_ID = ?
`;

export const findUsersFromHistory: Sql = `
  SELECT
    USER_ID
  FROM
    ${process.env.MEET_HISTORY_TABLE} AS M
  WHERE
    M.MEET_ID = ? AND M.CODE = ?
`;

export const removeUserFromMeetList: Sql = `
  DELETE FROM
    ${process.env.LIST_TABLE} AS MLT
  WHERE
    MLT.MEET_ID = ?
    AND MLT.USER_ID = ?
`;

export const addMeetLog: Sql = `
  INSERT INTO
    ${process.env.MEET_HISTORY_TABLE} (MEET_ID, USER_ID, DATE, CODE, CONTENT)
  VALUES ?
`;

export const updateMeetToStart: Sql = `
  UPDATE
    ${process.env.MEET_TABLE} AS M
  SET
    M.STATE = 30
  WHERE
    UID=?
`;

export const updateMeetToEnd: Sql = `
  UPDATE
    ${process.env.MEET_TABLE} AS M
  SET
    M.STATE = 60
  WHERE
    UID=?
`;
