import { BookOpen, History, MessageCircleQuestion, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { Alert, Empty, PageTitle } from '../components/Common'

export default function StudentDashboard() {
  const [subjects, setSubjects] = useState([])
  const [subjectId, setSubjectId] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState(null)
  const [history, setHistory] = useState([])
  const [quiz, setQuiz] = useState([])
  const [summary, setSummary] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const load = () => Promise.all([api.get('/subjects'), api.get('/rag/history')]).then(([s,h])=>{setSubjects(s.data);setHistory(h.data);if(s.data[0]&&!subjectId)setSubjectId(String(s.data[0].id))}).catch(e=>setError(errorMessage(e)))
  useEffect(()=>{load()}, [])
  const run = async (type) => {
    if (!subjectId) return setError('Select a subject first.')
    setLoading(type); setError('')
    try {
      if(type==='ask'){const {data}=await api.post('/rag/ask',{subject_id:+subjectId,question});setAnswer(data);setQuestion('');await load()}
      if(type==='quiz'){const {data}=await api.post('/quiz/generate',{subject_id:+subjectId,difficulty,question_count:+count});setQuiz(data.questions)}
      if(type==='summary'){const {data}=await api.post('/summary/generate',{subject_id:+subjectId});setSummary(data.summary)}
    } catch(e){setError(errorMessage(e))} finally{setLoading('')}
  }
  return <><PageTitle title="Learning workspace" subtitle="Study only from faculty-approved materials."/><Alert>{error}</Alert>
    <div className="panel mb-6 p-5"><label className="mb-2 block text-sm font-medium text-slate-300">Selected subject</label><select className="input" value={subjectId} onChange={e=>setSubjectId(e.target.value)}><option value="">Choose a subject</option>{subjects.map(s=><option value={s.id} key={s.id}>{s.code} · {s.name} ({s.document_count} materials)</option>)}</select></div>
    <div className="grid gap-6 xl:grid-cols-5"><section className="panel p-5 xl:col-span-3"><h2 className="flex items-center gap-2 text-lg font-bold"><MessageCircleQuestion className="text-emerald-400"/>Ask your tutor</h2><textarea className="input mt-4 min-h-32 resize-y" placeholder="Ask a question about the selected subject..." value={question} onChange={e=>setQuestion(e.target.value)}/><button className="btn-primary mt-3" disabled={!question.trim()||loading} onClick={()=>run('ask')}>{loading==='ask'?'Finding answer...':'Ask question'}</button>{answer&&<div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-5"><p className="whitespace-pre-wrap leading-7">{answer.answer}</p><p className="mt-4 text-xs text-slate-400">Source: {answer.document_name || 'No matching source'}{answer.page_number ? ` · Page ${answer.page_number}`:''} · {answer.subject}</p></div>}</section>
      <section className="panel p-5 xl:col-span-2"><h2 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="text-emerald-400"/>Study tools</h2><div className="mt-4 grid grid-cols-2 gap-3"><select className="input" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>easy</option><option>medium</option><option>hard</option></select><select className="input" value={count} onChange={e=>setCount(e.target.value)}><option>5</option><option>10</option><option>20</option></select></div><button className="btn-primary mt-3 w-full" disabled={loading} onClick={()=>run('quiz')}>Generate quiz</button><button className="btn-secondary mt-3 w-full" disabled={loading} onClick={()=>run('summary')}><BookOpen size={17}/>Generate summary</button></section>
    </div>
    {summary&&<section className="panel mt-6 p-6"><h2 className="text-lg font-bold">Subject summary</h2><p className="mt-4 whitespace-pre-wrap leading-7 text-slate-300">{summary}</p></section>}
    {!!quiz.length&&<section className="panel mt-6 p-6"><h2 className="text-lg font-bold">Generated quiz</h2><div className="mt-4 space-y-5">{quiz.map((q,i)=><details className="rounded-xl border border-white/10 p-4" key={i}><summary className="cursor-pointer font-medium">{i+1}. {q.question}</summary><div className="mt-3 space-y-2 text-slate-300">{q.options.map((o,j)=><p key={j}>{String.fromCharCode(65+j)}. {o}</p>)}<p className="pt-2 text-emerald-300">Answer: {q.answer}</p><p className="text-sm text-slate-400">{q.explanation}</p></div></details>)}</div></section>}
    <section className="mt-6"><h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><History className="text-emerald-400"/>Recent questions</h2>{history.length?<div className="space-y-3">{history.map(h=><div className="panel p-4" key={h.id}><p className="font-medium">{h.question}</p><p className="mt-2 line-clamp-2 text-sm text-slate-400">{h.answer}</p><p className="mt-2 text-xs text-emerald-300">{h.subject}{h.document_name?` · ${h.document_name}`:''}</p></div>)}</div>:<Empty>No questions yet.</Empty>}</section>
  </>
}

