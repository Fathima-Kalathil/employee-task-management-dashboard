import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { btnPrimary, inputCls } from '../components/Modal';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created. Welcome!');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-slate-100 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="text-2xl font-bold leading-tight text-indigo-600">▣ Employee Task Management Dashboard</div>
          <p className="mt-1 text-sm text-slate-500">Create your account</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input required className={inputCls} value={form.name} onChange={set('name')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" required className={inputCls} value={form.email} onChange={set('email')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" required className={inputCls} value={form.password} onChange={set('password')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
          <input type="password" required className={inputCls} value={form.confirm} onChange={set('confirm')} />
        </div>
        <button disabled={loading} className={`${btnPrimary} w-full py-2.5`}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
