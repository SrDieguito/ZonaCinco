// /api/save-report.js

import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Solo se permiten peticiones POST' });
  }

  const data = req.body;

  // Aquí puedes validar que data tenga los campos que necesitas
  if (
    !data.fecha ||
    data.ventas_efectivo == null ||
    data.ventas_transferencia == null ||
    data.egresos == null ||
    data.utilidad == null ||
    data.caja_inicial == null ||
    data.total_depositar == null
  ) {a
    return res.status(400).json({ message: 'Faltan datos obligatorios' });
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

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

    const [result] = await connection.execute(query, values);

    await connection.end();

    return res.status(200).json({ message: 'Reporte guardado', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ message: 'Error guardando reporte', error: error.message });
  }
}
