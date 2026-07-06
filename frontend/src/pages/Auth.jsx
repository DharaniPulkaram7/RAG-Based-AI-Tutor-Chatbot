import { GraduationCap } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { Alert } from '../components/Common'
import { useAuth } from '../contexts/AuthContext'

function AuthCard({ register = false }) {
  const { user, authenticate } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  if (user) return <Navigate to={`/${user.role}`} replace />
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { data } = await api.post(register ? '/auth/register' : '/auth/login', form)
      authenticate(data); navigate(`/${data.user.role}`)
    } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) }
  }
  return <div className="grid min-h-screen place-items-center px-4"><div className="panel w-full max-w-md p-7"><Link to="/" className="mb-7 flex items-center justify-center gap-3 text-xl font-bold"><span className="grid size-10 place-items-center rounded-xl bg-emerald-400 text-slate-950"><GraduationCap/></span>SmartEdu</Link><h1 className="text-2xl font-bold">{register ? 'Create student account' : 'Welcome back'}</h1><p className="mt-1 text-slate-400">{register ? 'Start learning from trusted course materials.' : 'Sign in to your learning workspace.'}</p><form onSubmit={submit} className="mt-6 space-y-4"><Alert>{error}</Alert>{register && <input className="input" placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}<input className="input" type="email" placeholder="Email address" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input className="input" type="password" placeholder="Password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="btn-primary w-full" disabled={loading}>{loading ? 'Please wait...' : register ? 'Create account' : 'Log in'}</button></form><p className="mt-5 text-center text-sm text-slate-400">{register ? 'Already registered?' : 'New to SmartEdu?'} <Link className="text-emerald-300 hover:underline" to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Create account'}</Link></p></div></div>
}
export const Login = () => <AuthCard />
export const Register = () => <AuthCard register />

