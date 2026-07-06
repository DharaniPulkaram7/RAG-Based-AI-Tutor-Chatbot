export const PageTitle = ({ title, subtitle, action }) => <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1><p className="mt-1 text-slate-400">{subtitle}</p></div>{action}</div>
export const Alert = ({ type = 'error', children }) => children ? <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${type === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/20 bg-rose-400/10 text-rose-200'}`}>{children}</div> : null
export const Empty = ({ children }) => <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-slate-400">{children}</div>
export const Stat = ({ label, value }) => <div className="panel p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value ?? '—'}</p></div>

