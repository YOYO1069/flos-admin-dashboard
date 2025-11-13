import { Outlet, Link, useLocation, useParams } from 'react-router-dom'
import { Building2, Users, Clock, Calendar, BarChart3, Key } from 'lucide-react'

export default function AdminLayout() {
  const location = useLocation()
  const { clinicId } = useParams()
  
  const isAdmin = location.pathname.startsWith('/admin')
  
  const adminMenuItems = [
    { path: '/admin', label: '總覽', icon: BarChart3 },
    { path: '/admin/clinics', label: '診所管理', icon: Building2 },
    { path: '/admin/auth-codes', label: '授權碼管理', icon: Key },
    { path: '/admin/attendance', label: '打卡總覽', icon: Clock },
    { path: '/admin/appointments', label: '預約總覽', icon: Calendar },
    { path: '/admin/statistics', label: '統計分析', icon: BarChart3 },
  ]
  
  const clinicMenuItems = clinicId ? [
    { path: `/clinic/${clinicId}`, label: '總覽', icon: BarChart3 },
    { path: `/clinic/${clinicId}/employees`, label: '員工管理', icon: Users },
    { path: `/clinic/${clinicId}/attendance`, label: '打卡記錄', icon: Clock },
    { path: `/clinic/${clinicId}/appointments`, label: '預約管理', icon: Calendar },
  ] : []
  
  const menuItems = isAdmin ? adminMenuItems : clinicMenuItems
  
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Building2 size={32} />
            <span>FLOS 管理系統</span>
          </div>
          <ul className="navbar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`navbar-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
