const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { rows } = await db.query(`
    select
      (select count(*) from employees)::int as employees,
      count(*)::int as total,
      (count(*) filter (where status = 'pending'))::int as pending,
      (count(*) filter (where status = 'in-progress'))::int as "inProgress",
      (count(*) filter (where status = 'completed'))::int as completed
    from tasks`);
  res.json(rows[0]);
});

module.exports = router;
