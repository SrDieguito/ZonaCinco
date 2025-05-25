// pages/api/reportes/index.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default async function handler(req, res) {
  try {
    const { fecha } = req.query;
    const conn = await pool.getConnection();

    let query = 'SELECT id, fecha, utilidad, total_depositar FROM reportes';
    let values = [];

    if (fecha) {
      query += ' WHERE fecha = ?';
      values.push(fecha);
    }

    const [rows] = await conn.execute(query, values);
    conn.release();

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ message: 'Error al obtener reportes' });
  }
}
