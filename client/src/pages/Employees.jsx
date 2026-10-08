import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import Modal, { btnGhost, btnPrimary, inputCls } from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const empty = { name: '', email: '', position: '', phone: '' };

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => api.get('/employees').then((r) => setEmployees(r.data)).catch(() => toast.error('Failed to load'));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (e) => {
    setForm({ name: e.name, email: e.email, position: e.position, phone: e.phone });
    setEditId(e._id);
    setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/employees/${editId}`, form);
      else await api.post('/employees', form);
      toast.success(editId ? 'Employee updated' : 'Employee added');
      setModal(false);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/employees/${toDelete._id}`);
      toast.success('Employee deleted');
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = employees.filter((e) =>
    `${e.name} ${e.email} ${e.position}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
        <button onClick={openAdd} className={btnPrimary}>+ Add Employee</button>
      </div>
      <input
        className={`${inputCls} mb-4 max-w-sm bg-white`}
        placeholder="Search employees..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Position</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e._id} className="border-b last:border-0">
                <td className="p-3 font-medium text-slate-800">{e.name}</td>
                <td className="p-3">{e.email}</td>
                <td className="p-3">{e.position || '-'}</td>
                <td className="p-3">{e.phone || '-'}</td>
                <td className="whitespace-nowrap p-3 text-right">
                  <button onClick={() => openEdit(e)} className="mr-3 text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => setToDelete(e)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan="5" className="p-6 text-center text-slate-400">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={editId ? 'Edit Employee' : 'Add Employee'} onClose={() => setModal(false)}>
          <form onSubmit={submit} className="space-y-4">
            {[
              ['name', 'Name', 'text', true],
              ['email', 'Email', 'email', true],
              ['position', 'Position', 'text', false],
              ['phone', 'Phone', 'text', false],
            ].map(([key, label, type, req]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
                <input
                  type={type}
                  required={req}
                  className={inputCls}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModal(false)} className={btnGhost}>Cancel</button>
              <button disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          message={`Delete ${toDelete.name}? Their tasks will become unassigned.`}
          onConfirm={doDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
