import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "@/config";
import mysql from "mysql2/promise";
import {User} from "@/types"

export const db = mysql.createPool({
  database: DB_NAME,
  user: DB_USER,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 100,
});

export default db;

export async function getUser(user_id: number): Promise<User> {
  const [queryRS] = await db.execute("select * from usuarios where id=? limit 1", [user_id]);

  return (queryRS as User[])[0]
}