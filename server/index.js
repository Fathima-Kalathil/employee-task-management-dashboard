require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', auth, require('./routes/employees'));
app.use('/api/tasks', auth, require('./routes/tasks'));
app.use('/api/stats', auth, require('./routes/stats'));

// Postgres error codes -> friendly messages
app.use((err, req, res, next) => {
  if (err.code === '23505') return res.status(400).json({ message: 'Email already exists' });
  if (err.code === '23502') return res.status(400).json({ message: 'A required field is missing' });
  if (err.code === '23514' || err.code === '22P02' || err.code === '22007' || err.code === '22008')
    return res.status(400).json({ message: 'Invalid value provided' });
  if (err.code === '23503') return res.status(400).json({ message: 'Selected employee does not exist' });
  console.error(err);
  res.status(500).json({ message: 'Server error. Check DATABASE_URL and that schema.sql has been run.' });
});

if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

module.exports = app;
