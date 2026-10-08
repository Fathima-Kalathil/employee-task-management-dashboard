import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import Modal, { btnGhost, btnPrimary, inputCls } from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { PriorityBadge, statusLabel } from '../components/Badges';

const empty = { title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '', status: 'pending' };
const tabs = [['', 'All'], ['pending', 'Pending'], ['in-progress', 'In Progress'], ['completed', 'Completed']];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ status: '', employee: '' });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.employee) params.employee = filters.employee;
    const { data } = await api.get('/tasks', { params });
    setTasks(data);
  }, [filters]);

  useEffect(() => { load().catch(() => toast.error('Failed to load tasks')); }, [load]);
  useEffect(() => { api.get('/employees').then((r) => setEmployees(r.data)); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (t) => {
    setForm({
      title: t.title,
      description: t.description,
      assignedTo: t.assignedTo?._id || '',
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
      status: t.status,
    });
    setEditId(t._id);
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/tasks/${editId}`, form);
      else await api.post('/tasks', form);
      toast.success(editId ? 'Task updated' : 'Task created');
      setModal(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${toDelete._id}`);
      toast.success('Task deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const today = new Date().setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
        <button onClick={openAdd} className={btnPrimary}>+ New Task</button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex overflow-x-auto rounded-lg bg-white p-1 shadow-sm">
          {tabs.map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilters({ ...filters, status: val })}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ${
                filters.status === val ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          className={`${inputCls} max-w-[220px] bg-white`}
          value={filters.employee}
          onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
        >
          <option value="">All employees</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>{emp.name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Task</th>
              <th className="p-3">Employee</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Due date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => {
              const overdue = t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < today;
              return (
                <tr key={t._id} className="border-b align-top last:border-0">
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{t.title}</div>
                    {t.description && <div className="max-w-xs text-xs text-slate-500">{t.description}</div>}
                  </td>
                  <td className="p-3">{t.assignedTo?.name || <span className="text-slate-400">Unassigned</span>}</td>
                  <td className="p-3"><PriorityBadge value={t.priority} /></td>
                  <td className={`whitespace-nowrap p-3 ${overdue ? 'font-medium text-red-600' : ''}`}>
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-3">
                    <select
                      value={t.status}
                      onChange={(e) => changeStatus(t._id, e.target.value)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                    >
                      {Object.entries(statusLabel).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap p-3 text-right">
                    <button onClick={() => openEdit(t)} className="mr-3 text-indigo-600 hover:underline">Edit</button>
                    <button onClick={() => setToDelete(t)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              );
            })}
            {!tasks.length && (
              <tr><td colSpan="6" className="p-6 text-center text-slate-400">No tasks found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editId ? 'Edit Task' : 'New Task'} onClose={() => setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input required className={inputCls} value={form.title} onChange={set('title')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea rows="3" className={inputCls} value={form.description} onChange={set('description')} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Assign to</label>
              <select className={inputCls} value={form.assignedTo} onChange={set('assignedTo')}>
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                <select className={inputCls} value={form.priority} onChange={set('priority')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due date</label>
                <input type="date" className={inputCls} value={form.dueDate} onChange={set('dueDate')} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <select className={inputCls} value={form.status} onChange={set('status')}>
                  {Object.entries(statusLabel).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className={btnGhost}>Cancel</button>
              <button disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Delete the task "${toDelete.title}"? This cannot be undone.`}
          onConfirm={doDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
