import { ArrowRight, BookOpenCheck, BrainCircuit, FileLock2, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return <div className="min-h-screen">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5"><div className="flex items-center gap-3 text-lg font-bold"><span className="grid size-10 place-items-center rounded-xl bg-emerald-400 text-slate-950"><GraduationCap/></span>SmartEdu</div><div className="flex gap-2"><Link className="btn-secondary" to="/login">Log in</Link><Link className="btn-primary" to="/register">Get started</Link></div></nav>
    <main className="mx-auto max-w-7xl px-5 py-20 text-center md:py-28">
      <div className="mx-auto max-w-4xl"><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">Grounded learning. Trusted sources.</span><h1 className="mt-8 text-5xl font-black tracking-tight text-white md:text-7xl">Your college materials, now an <span className="text-emerald-400">AI tutor.</span></h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">Ask questions, create quizzes, and generate summaries from faculty-approved study materials only.</p><div className="mt-9 flex justify-center gap-3"><Link className="btn-primary" to="/register">Start learning <ArrowRight size={18}/></Link><Link className="btn-secondary" to="/login">Faculty login</Link></div></div>
      <div className="mt-24 grid gap-5 text-left md:grid-cols-3">{[[FileLock2,'Source grounded','Answers stay inside uploaded materials.'],[BrainCircuit,'Active learning','Generate quizzes at your chosen difficulty.'],[BookOpenCheck,'Faculty controlled','Educators own subjects and resources.']].map(([Icon,title,text])=><div className="panel p-6" key={title}><Icon className="text-emerald-400"/><h2 className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-slate-400">{text}</p></div>)}</div>
    </main>
  </div>
}

