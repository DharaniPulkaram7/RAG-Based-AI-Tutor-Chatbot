import { BookOpen, GraduationCap, LayoutDashboard, Library, LogOut, Menu, Moon, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const links = [
    { to: `/${user.role}`, label: 'Dashboard', icon: LayoutDashboard },
    ...(user.role !== 'student' ? [{ to: '/subjects', label: 'Subjects', icon: BookOpen }, { to: '/materials', label: 'Materials', icon: Library }] : []),
    ...(user.role === 'admin' ? [{ to: '/admin/users', label: 'Users', icon: Users }] : []),
  ]
  const signOut = async () => { await logout(); navigate('/') }
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111f]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <NavLink to="/" className="flex items-center gap-3 font-bold"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-slate-950"><GraduationCap size={20}/></span>SmartEdu</NavLink>
          <button className="btn-secondary lg:hidden" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>
          <div className="hidden items-center gap-3 lg:flex"><Moon size={17} className="text-slate-400"/><span className="text-sm text-slate-300">{user.name} · {user.role}</span><button onClick={signOut} className="btn-secondary"><LogOut size={16}/> Logout</button></div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl">
        <aside className={`${open ? 'block' : 'hidden'} fixed inset-x-0 top-16 z-30 border-b border-white/10 bg-slate-950 p-4 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:w-60 lg:border-b-0 lg:border-r`}>
          <nav className="space-y-2">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({isActive}) => `flex items-center gap-3 rounded-xl px-4 py-3 ${isActive ? 'bg-emerald-400/15 text-emerald-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon size={19}/>{label}</NavLink>)}</nav>
          <button onClick={signOut} className="btn-secondary mt-4 w-full lg:hidden"><LogOut size={16}/> Logout</button>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-7"><Outlet /></main>
      </div>
    </div>
  )
}

