const router = require('express').Router();
const db = require('../db');

// "_id" alias keeps the response shape the React app expects
const COLS = 'id as "_id", name, email, position, phone';

router.get('/', async (req, res) => {
  const { rows } = await db.query(`select ${COLS} from employees order by created_at desc, id desc`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, email, position = '', phone = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });
  const { rows } = await db.query(
    `insert into employees (name, email, position, phone) values ($1, $2, $3, $4) returning ${COLS}`,
    [name.trim(), email.trim().toLowerCase(), position.trim(), phone.trim()]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, email, position = '', phone = '' } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Name is required' });
  if (!email?.trim()) return res.status(400).json({ message: 'Email is required' });
  const { rows } = await db.query(
    `update employees set name = $1, email = $2, position = $3, phone = $4 where id = $5 returning ${COLS}`,
    [name.trim(), email.trim().toLowerCase(), position.trim(), phone.trim(), req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Employee not found' });
  res.json(rows[0]);
});

// tasks.assigned_to is "on delete set null", so their tasks become unassigned automatically
router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('delete from employees where id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ message: 'Employee not found' });
  res.json({ message: 'Employee deleted' });
});

module.exports = router;
