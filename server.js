const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Servir archivos estáticos desde el directorio "public"
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tspDB',
    password: '123456',
    port: 5432,
});

app.get('/api/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Articulos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM Articulos WHERE articulo_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Book not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Servir archivos estáticos para la aplicación de "ingresar"
app.use('/login', express.static(path.join('D:', 'Downloads', 'INTERFAZWEB', 'INTERFAZWEB')));

// Servir archivos estáticos para la búsqueda avanzada
app.use('/advsearch', express.static(path.join('D:', 'AdvSearch', 'public')));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
