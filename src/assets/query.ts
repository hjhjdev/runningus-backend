import { Sql } from 'types/query';

export const testQuery: Sql = `
    SELECT  *
    FROM    ${process.env.USER_TABLE};
`;

export const findOauthId: Sql = `
    SELECT UID
    FROM   ${process.env.USER_TABLE} AS U
    WHERE  U.OAUTH_ID = ?;
`;

export const insertInitialUser: Sql = `
    INSERT
    INTO   ${process.env.USER_TABLE}
           (
               OAUTH_ID
           )
    VALUES
           (
               ?
           )
`;
