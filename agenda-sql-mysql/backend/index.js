const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');

app.use(cors());
app.use(express.json());

// Crear
app.post('/agenda', (req, res) => {
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;
  db.query(
    'INSERT INTO agenda (nombres, apellidos, fecha_nacimiento, direccion, celular, correo) VALUES (?, ?, ?, ?, ?, ?)',
    [nombres, apellidos, fecha_nacimiento, direccion, celular, correo],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ id: result.insertId, ...req.body });
    }
  );
});

// Leer
app.get('/agenda', (req, res) => {
  db.query('SELECT * FROM agenda', (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Actualizar
app.put('/agenda/:id', (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, fecha_nacimiento, direccion, celular, correo } = req.body;
  db.query(
    'UPDATE agenda SET nombres=?, apellidos=?, fecha_nacimiento=?, direccion=?, celular=?, correo=? WHERE id=?',
    [nombres, apellidos, fecha_nacimiento, direccion, celular, correo, id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send('Actualizado');
    }
  );
});

// Eliminar
app.delete('/agenda/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM agenda WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Eliminado');
  });
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
