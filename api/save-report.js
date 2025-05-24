import mysql from 'mysql2/promise';
import { z } from 'zod';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const ReportSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ventas_efectivo: z.number(),
  ventas_transferencia: z.number(),
  egresos: z.number(),
  utilidad: z.number(),
  caja_inicial: z.number(),
  cuanto_queda: z.number(),
  total_depositar: z.number(),
  detalle_egresos: z.array(z.object({
    categoria: z.string(),
    monto: z.number()
  })),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Solo se permiten peticiones POST' });
  }

  try {
    const data = ReportSchema.parse(req.body);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        `INSERT INTO reportes 
        (fecha, ventas_efectivo, ventas_transferencia, egresos, utilidad, caja_inicial, cuanto_queda, total_depositar, detalle_egresos) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.fecha,
          data.ventas_efectivo,
          data.ventas_transferencia,
          data.egresos,
          data.utilidad,
          data.caja_inicial,
          data.cuanto_queda,
          data.total_depositar,
        ]
      );

      const reporteId = result.insertId;

      for (const egreso of data.detalle_egresos) {
        await conn.execute(
          `INSERT INTO egresos (reporte_id, categoria, monto) VALUES (?, ?, ?)`,
          [reporteId, egreso.categoria, egreso.monto]
        );
      }

      await conn.commit();
      conn.release();

      return res.status(200).json({ message: 'Reporte y egresos guardados', id: reporteId });

    } catch (dbError) {
      await conn.rollback();
      conn.release();
      throw dbError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors.map(e => e.message),
      });
    }

    console.error('Error al guardar el reporte:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });

  }
}
