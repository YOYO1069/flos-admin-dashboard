import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import ClinicsManagement from './pages/admin/ClinicsManagement'
import AuthCodesManagement from './pages/admin/AuthCodesManagement'
import AttendanceOverview from './pages/admin/AttendanceOverview'
import AppointmentsOverview from './pages/admin/AppointmentsOverview'
import Statistics from './pages/admin/Statistics'
import ClinicDashboard from './pages/clinic/Dashboard'
import ClinicEmployees from './pages/clinic/Employees'
import ClinicAttendance from './pages/clinic/Attendance'
import ClinicAppointments from './pages/clinic/Appointments'
import BookingForm from './pages/BookingForm'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 超級管理員路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="clinics" element={<ClinicsManagement />} />
          <Route path="auth-codes" element={<AuthCodesManagement />} />
          <Route path="attendance" element={<AttendanceOverview />} />
          <Route path="appointments" element={<AppointmentsOverview />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>

        {/* 診所管理員路由 */}
        <Route path="/clinic/:clinicId" element={<AdminLayout />}>
          <Route index element={<ClinicDashboard />} />
          <Route path="employees" element={<ClinicEmployees />} />
          <Route path="attendance" element={<ClinicAttendance />} />
          <Route path="appointments" element={<ClinicAppointments />} />
        </Route>

        {/* 公開預約表單路由 (不需要 AdminLayout) */}
        <Route path="/booking/:clinicId" element={<BookingForm />} />

        {/* 預設重定向到管理員頁面 */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
