// api/egresos.js

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { categoria, monto, fecha } = req.body;

    if (!categoria || !monto || !fecha) {
      return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
      const [result] = await pool.query(
        'INSERT INTO egresos (categoria, monto, fecha) VALUES (?, ?, ?)',
        [categoria, monto, fecha]
      );
      res.status(201).json({ message: 'Egreso guardado', id: result.insertId });
    } catch (error) {
      console.error('Error guardando egreso:', error);
      res.status(500).json({ message: 'Error al guardar egreso' });
    }

  } else if (req.method === 'GET') {
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ message: 'Falta el parámetro "fecha"' });
    }

    try {
      const [rows] = await pool.query(
        'SELECT categoria, monto FROM egresos WHERE fecha = ?',
        [fecha]
      );
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error al obtener egresos:', error);
      res.status(500).json({ message: 'Error al obtener egresos' });
    }

  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
