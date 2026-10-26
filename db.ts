import "dotenv/config";
import mysql from "mysql2/promise";
const {
  DB_HOST = "localhost",
  DB_PORT = "3306",
  DB_USER = "root",
  DB_PASS = "",
  DB_NAME = "campuscare",
} = process.env;
export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
});
/** Helper: run a query and get typed rows back */
export async function query<T = Record<string, unknown>>(
  sql: string,
  values?: unknown[]
): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await pool.execute(sql, values as any);
  return rows as T[];
}
/** Helper: run a query and get the ResultSetHeader (for INSERT/UPDATE/DELETE) */
export async function execute(sql: string, values?: unknown[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result] = await pool.execute(sql, values as any);
  return result as mysql.ResultSetHeader;
}
