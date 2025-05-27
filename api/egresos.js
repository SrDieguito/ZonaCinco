const express = require('express');
const app = express();
app.use(express.json());

let egresosDB = []; // Simulación DB en memoria

// Obtener egresos por fecha
app.get('/api/egresos', (req, res) => {
  const fecha = req.query.fecha;
  if (!fecha) return res.status(400).json({ message: 'Falta la fecha' });
  const egresos = egresosDB.filter(e => e.fecha === fecha);
  res.json(egresos);
});

// Agregar un egreso
app.post('/api/egresos', (req, res) => {
  const { categoria, monto, fecha } = req.body;
  if (!categoria || !monto || !fecha) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }
  egresosDB.push({ categoria, monto, fecha });
  res.status(201).json({ message: 'Egreso guardado' });
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
