const router = require('express').Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

// Passwords are stored as salt:hash (scrypt), never in plain text
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
};

const verifyPassword = (password, stored) => {
  const [salt, key] = stored.split(':');
  const expected = Buffer.from(key, 'hex');
  const actual = crypto.scryptSync(password, salt, 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};

const sign = (email, name) =>
  jwt.sign({ email, name, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });
  if (!password || password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const { rows } = await db.query(
    'insert into users (name, email, password_hash) values ($1, $2, $3) returning name, email',
    [name.trim(), email.trim().toLowerCase(), hashPassword(password)]
  );
  res.status(201).json({ token: sign(rows[0].email, rows[0].name), email: rows[0].email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  // Built-in admin from environment variables still works
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
    return res.json({ token: sign(email, 'Admin'), email });

  const { rows } = await db.query('select name, email, password_hash from users where email = $1', [
    email.trim().toLowerCase(),
  ]);
  if (!rows.length || !verifyPassword(password, rows[0].password_hash))
    return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: sign(rows[0].email, rows[0].name), email: rows[0].email });
});

module.exports = router;
