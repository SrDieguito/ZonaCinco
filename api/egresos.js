// api/egresos.js

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'TU_HOST',
  user: 'TU_USUARIO',
  password: 'TU_PASSWORD',
  database: 'TU_BASE_DE_DATOS',
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
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Método ${req.method} no permitido`);
  }
}
