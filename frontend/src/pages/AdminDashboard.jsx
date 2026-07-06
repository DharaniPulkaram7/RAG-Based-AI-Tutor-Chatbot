import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { Alert, PageTitle, Stat } from '../components/Common'

export default function AdminDashboard() {
  const [data,setData]=useState({});const[error,setError]=useState('')
  useEffect(()=>{api.get('/admin/analytics').then(r=>setData(r.data)).catch(e=>setError(errorMessage(e)))},[])
  const labels={total_users:'Total users',total_students:'Students',total_faculty:'Faculty',total_subjects:'Subjects',total_documents:'Documents',total_questions_asked:'Questions asked'}
  return <><PageTitle title="Admin overview" subtitle="Platform health and learning activity at a glance."/><Alert>{error}</Alert><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(labels).map(([key,label])=><Stat key={key} label={label} value={data[key]}/>)}</div></>
}

