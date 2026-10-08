const router = require('express').Router();
const db = require('../db');

const SELECT = `
  select t.id as "_id", t.title, t.description, t.priority, t.status,
         to_char(t.due_date, 'YYYY-MM-DD') as "dueDate",
         t.created_at as "createdAt",
         case when e.id is null then null
              else json_build_object('_id', e.id, 'name', e.name, 'email', e.email) end as "assignedTo"
  from tasks t
  left join employees e on e.id = t.assigned_to`;

const getOne = async (id) => (await db.query(`${SELECT} where t.id = $1`, [id])).rows[0];

const clean = (b) => ({
  title: (b.title || '').trim(),
  description: (b.description || '').trim(),
  assignedTo: b.assignedTo || null,
  priority: b.priority || 'medium',
  dueDate: b.dueDate || null,
  status: b.status || 'pending',
});

router.get('/', async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.status) { params.push(req.query.status); where.push(`t.status = $${params.length}`); }
  if (req.query.employee) { params.push(req.query.employee); where.push(`t.assigned_to = $${params.length}`); }
  const sql = `${SELECT} ${where.length ? 'where ' + where.join(' and ') : ''} order by t.created_at desc, t.id desc`;
  res.json((await db.query(sql, params)).rows);
});

router.post('/', async (req, res) => {
  const t = clean(req.body);
  if (!t.title) return res.status(400).json({ message: 'Title is required' });
  const { rows } = await db.query(
    `insert into tasks (title, description, assigned_to, priority, due_date, status)
     values ($1, $2, $3, $4, $5, $6) returning id`,
    [t.title, t.description, t.assignedTo, t.priority, t.dueDate, t.status]
  );
  res.status(201).json(await getOne(rows[0].id));
});

router.put('/:id', async (req, res) => {
  const t = clean(req.body);
  if (!t.title) return res.status(400).json({ message: 'Title is required' });
  const { rows } = await db.query(
    `update tasks set title = $1, description = $2, assigned_to = $3, priority = $4, due_date = $5, status = $6
     where id = $7 returning id`,
    [t.title, t.description, t.assignedTo, t.priority, t.dueDate, t.status, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Task not found' });
  res.json(await getOne(rows[0].id));
});

router.patch('/:id/status', async (req, res) => {
  const { rows } = await db.query('update tasks set status = $1 where id = $2 returning id', [
    req.body.status,
    req.params.id,
  ]);
  if (!rows.length) return res.status(404).json({ message: 'Task not found' });
  res.json(await getOne(rows[0].id));
});

router.delete('/:id', async (req, res) => {
  const { rowCount } = await db.query('delete from tasks where id = $1', [req.params.id]);
  if (!rowCount) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
});

module.exports = router;
