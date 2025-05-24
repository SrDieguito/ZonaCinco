// /api/save-report.js

import mysql from 'mysql2/promise';
import { z } from 'zod';

// Creamos un pool de conexiones reutilizable
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Esquema de validación con Zod
const ReportSchema = z.object({
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Formato de fecha inválido (debe ser YYYY-MM-DD)',
  }),
  ventas_efectivo: z.number(),
  ventas_transferencia: z.number(),
  egresos: z.number(),
  utilidad: z.number(),
  caja_inicial: z.number(),
  total_depositar: z.number(),
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Solo se permiten peticiones POST' });
  }

  try {
    // Validamos los datos del body con Zod
    const data = ReportSchema.parse(req.body);

    const query = `
      INSERT INTO reportes 
      (fecha, ventas_efectivo, ventas_transferencia, egresos, utilidad, caja_inicial, total_depositar) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.fecha,
      data.ventas_efectivo,
      data.ventas_transferencia,
      data.egresos,
      data.utilidad,
      data.caja_inicial,
      data.total_depositar,
    ];

    const [result] = await pool.execute(query, values);

    return res.status(200).json({ message: 'Reporte guardado', id: result.insertId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: error.errors.map((e) => e.message),
      });
    }

    console.error('Error al guardar el reporte:', error);
    return res.status(500).json({ message: 'Error guardando reporte', error: error.message });
  }
}
