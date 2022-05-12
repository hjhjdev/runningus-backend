import { Sql } from 'types/query';

export const testQuery: Sql = `
    SELECT  *
    FROM    ${process.env.USER_TABLE};
`;
