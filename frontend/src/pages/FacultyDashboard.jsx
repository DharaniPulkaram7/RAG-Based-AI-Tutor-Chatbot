import { BookOpen, Files, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { Alert, PageTitle, Stat } from '../components/Common'
import { Link } from 'react-router-dom'

export default function FacultyDashboard() {
  const [subjects,setSubjects]=useState([]); const [materials,setMaterials]=useState([]); const [error,setError]=useState('')
  useEffect(()=>{Promise.all([api.get('/subjects'),api.get('/materials')]).then(([s,m])=>{setSubjects(s.data);setMaterials(m.data)}).catch(e=>setError(errorMessage(e)))},[])
  return <><PageTitle title="Faculty dashboard" subtitle="Build trusted learning collections for your students."/><Alert>{error}</Alert><div className="grid gap-4 sm:grid-cols-2"><Stat label="Total subjects" value={subjects.length}/><Stat label="Uploaded materials" value={materials.length}/></div><div className="mt-6 grid gap-5 md:grid-cols-2"><Link to="/subjects" className="panel p-6 transition hover:border-emerald-400/30"><BookOpen className="text-emerald-400"/><h2 className="mt-4 text-xl font-bold">Manage subjects</h2><p className="mt-2 text-slate-400">Create, update, and organize college subjects.</p></Link><Link to="/materials" className="panel p-6 transition hover:border-emerald-400/30"><Files className="text-emerald-400"/><h2 className="mt-4 text-xl font-bold">Material library</h2><p className="mt-2 text-slate-400">Upload course files and rebuild subject embeddings.</p></Link></div><div className="panel mt-6 p-6"><h2 className="flex items-center gap-2 font-bold"><RefreshCw size={18} className="text-emerald-400"/>Index status</h2><p className="mt-2 text-slate-400">{materials.reduce((n,m)=>n+m.chunk_count,0)} searchable chunks across all materials.</p></div></>
}

