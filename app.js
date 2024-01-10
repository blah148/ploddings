const express = require('express');
const pool = require('./dbConfig');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the homepage'); // Replace with your desired homepage content
});

app.get('/songs/:q', async (req, res) => {
  try {
    const searchTerm = req.params.q;
    const query = 'SELECT * FROM songs WHERE slug = $1';

    const { rows } = await pool.query(query, [searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/threads/:q', async (req, res) => {
  try {
    const searchTerm = req.params.q;
    const query = 'SELECT * FROM threads WHERE slug = $1';

    const { rows } = await pool.query(query, [searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/blog/:q', async (req, res) => {
  try {
    const searchTerm = req.params.q;
    const query = 'SELECT * FROM blog WHERE slug = $1';

    const { rows } = await pool.query(query, [searchTerm]);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
