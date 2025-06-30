import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "@/config";
import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  database: DB_NAME,
  user: DB_USER,
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  password: DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 100,
});

export default pool;
