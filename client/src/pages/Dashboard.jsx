import { useEffect, useState } from 'react';
import api from '../api';
import { PriorityBadge, StatusBadge } from '../components/Badges';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data));
    api.get('/tasks').then((r) => setRecent(r.data.slice(0, 6)));
  }, []);

  const cards = stats && [
    { label: 'Total Employees', value: stats.employees, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Pending Tasks', value: stats.pending, color: 'text-slate-700 bg-slate-100' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600 bg-blue-50' },
    { label: 'Completed', value: stats.completed, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards?.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className={`mt-2 inline-block rounded-lg px-3 py-1 text-3xl font-bold ${c.color}`}>
              {c.value}
            </p>
          </div>
        ))}
      </div>
      {stats && <p className="mt-3 text-sm text-slate-500">Total tasks: {stats.total}</p>}

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Recent tasks</h2>
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr key={t._id} className="border-b last:border-0">
                <td className="p-3 font-medium text-slate-800">{t.title}</td>
                <td className="p-3">{t.assignedTo?.name || <span className="text-slate-400">Unassigned</span>}</td>
                <td className="p-3"><PriorityBadge value={t.priority} /></td>
                <td className="p-3">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                <td className="p-3"><StatusBadge value={t.status} /></td>
              </tr>
            ))}
            {!recent.length && (
              <tr><td colSpan="5" className="p-6 text-center text-slate-400">No tasks yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
