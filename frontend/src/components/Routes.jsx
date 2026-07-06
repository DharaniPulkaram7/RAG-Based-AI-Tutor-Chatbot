import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Gate({ roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center text-emerald-300">Loading SmartEdu...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}
export const ProtectedRoute = () => <Gate />
export const StudentRoute = () => <Gate roles={['student']} />
export const FacultyRoute = () => <Gate roles={['faculty', 'admin']} />
export const AdminRoute = () => <Gate roles={['admin']} />

