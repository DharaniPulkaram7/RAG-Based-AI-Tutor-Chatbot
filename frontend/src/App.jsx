import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { AdminRoute, FacultyRoute, ProtectedRoute, StudentRoute } from './components/Routes'
import { AuthProvider } from './contexts/AuthContext'
import AdminDashboard from './pages/AdminDashboard'
import { Login, Register } from './pages/Auth'
import FacultyDashboard from './pages/FacultyDashboard'
import Landing from './pages/Landing'
import Materials from './pages/Materials'
import StudentDashboard from './pages/StudentDashboard'
import Subjects from './pages/Subjects'
import Users from './pages/Users'

export default function App() {
  return <AuthProvider><BrowserRouter><Routes>
    <Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/register" element={<Register/>}/>
    <Route element={<ProtectedRoute/>}><Route element={<Layout/>}>
      <Route element={<StudentRoute/>}><Route path="/student" element={<StudentDashboard/>}/></Route>
      <Route element={<FacultyRoute/>}><Route path="/faculty" element={<FacultyDashboard/>}/><Route path="/subjects" element={<Subjects/>}/><Route path="/materials" element={<Materials/>}/></Route>
      <Route element={<AdminRoute/>}><Route path="/admin" element={<AdminDashboard/>}/><Route path="/admin/users" element={<Users/>}/></Route>
    </Route></Route>
    <Route path="*" element={<Landing/>}/>
  </Routes></BrowserRouter></AuthProvider>
}

