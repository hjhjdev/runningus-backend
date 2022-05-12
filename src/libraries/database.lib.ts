import { createPool, Pool } from 'mysql2';
import { DbQueryResult } from 'types/database';
import { Sql } from 'types/query';

/**
 * 데이터베이스 관련 조작 클래스
 */
class Database {
  private static instance: Database;

  private pool: Pool;

  private constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 30,
      queueLimit: 0,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }

    // async-await 사용을 위해 pool.promise() 리턴
    return this.instance.pool.promise();
  }

  public static async query<T>(sql: Sql, options?: unknown): Promise<DbQueryResult<T>> {
    const connector = Database.getInstance();
    const [result] = await connector.query<DbQueryResult<T>>(sql, options);
    return result;
  }
}

export default Database;
