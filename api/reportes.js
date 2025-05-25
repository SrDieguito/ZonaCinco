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

    let query = `
      SELECT r.id, r.fecha, r.ventas_efectivo, r.ventas_transferencia, r.egresos, r.utilidad,
             r.caja_inicial, r.cuanto_queda, r.total_depositar, r.detalle_egresos
      FROM reportes r
    `;
    let values = [];

    if (fecha) {
      query += ' WHERE r.fecha = ?';
      values.push(fecha);
    }

    const [reportes] = await conn.execute(query, values);

    // Parsear detalle_egresos JSON para cada reporte
    const reportesConDetalle = reportes.map(r => ({
      ...r,
      detalle_egresos: r.detalle_egresos ? JSON.parse(r.detalle_egresos) : []
    }));

    conn.release();

    res.status(200).json(reportesConDetalle);
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ message: 'Error al obtener reportes' });
  }
}
