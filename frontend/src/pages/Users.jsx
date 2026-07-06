import { Trash2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { Alert, Empty, PageTitle } from '../components/Common'

export default function Users() {
  const [users,setUsers]=useState([]);const[form,setForm]=useState({name:'',email:'',password:''});const[error,setError]=useState('');const[message,setMessage]=useState('')
  const load=()=>api.get('/admin/users').then(r=>setUsers(r.data)).catch(e=>setError(errorMessage(e)));useEffect(()=>{load()},[])
  const create=async e=>{e.preventDefault();try{await api.post('/auth/create_faculty',form);setForm({name:'',email:'',password:''});setMessage('Faculty account created.');load()}catch(err){setError(errorMessage(err))}}
  const remove=async id=>{if(!confirm('Delete this user?'))return;try{await api.delete(`/admin/users/${id}`);load()}catch(e){setError(errorMessage(e))}}
  return <><PageTitle title="User management" subtitle="Create faculty accounts and manage platform access."/><Alert>{error}</Alert><Alert type="success">{message}</Alert><form onSubmit={create} className="panel mb-6 grid gap-3 p-5 md:grid-cols-[1fr_1fr_1fr_auto]"><input className="input" placeholder="Faculty name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="input" type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input className="input" type="password" minLength="6" placeholder="Temporary password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="btn-primary"><UserPlus size={17}/>Create</button></form>{users.length?<div className="panel overflow-x-auto"><table className="w-full text-left"><thead className="border-b border-white/10 text-sm text-slate-400"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4"></th></tr></thead><tbody>{users.map(u=><tr className="border-b border-white/5" key={u.id}><td className="p-4">{u.name}</td><td className="p-4 text-slate-400">{u.email}</td><td className="p-4"><span className="rounded-lg bg-white/5 px-2 py-1 text-xs uppercase">{u.role}</span></td><td className="p-4 text-right">{u.role!=='admin'&&<button className="btn-danger px-3" onClick={()=>remove(u.id)}><Trash2 size={16}/></button>}</td></tr>)}</tbody></table></div>:<Empty>No users found.</Empty>}</>
}

