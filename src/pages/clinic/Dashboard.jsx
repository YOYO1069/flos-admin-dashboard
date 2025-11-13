import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, TABLES } from '../../lib/supabase'
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react'

export default function ClinicDashboard() {
  const { clinicId } = useParams()
  const [clinic, setClinic] = useState(null)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: 0,
    pendingAppointments: 0,
    thisMonthAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [clinicId])

  async function fetchData() {
    try {
      // 獲取診所資訊
      const { data: clinicData } = await supabase
        .from(TABLES.CLINICS)
        .select('*')
        .eq('id', clinicId)
        .single()

      setClinic(clinicData)

      // 獲取員工總數
      const { count: employeesCount } = await supabase
        .from(TABLES.EMPLOYEES)
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('is_active', true)

      // 獲取今日打卡數
      const today = new Date().toISOString().split('T')[0]
      const { count: attendanceCount } = await supabase
        .from(TABLES.ATTENDANCE_RECORDS)
        .select(`
          *,
          employees!inner (
            clinic_id
          )
        `, { count: 'exact', head: true })
        .eq('employees.clinic_id', clinicId)
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`)

      // 獲取待確認預約數
      const { count: pendingCount } = await supabase
        .from(TABLES.APPOINTMENTS)
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('status', '待確認')

      // 獲取本月預約數
      const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
      const { count: monthCount } = await supabase
        .from(TABLES.APPOINTMENTS)
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .gte('appointment_date', firstDay)
        .lte('appointment_date', lastDay)

      setStats({
        totalEmployees: employeesCount || 0,
        todayAttendance: attendanceCount || 0,
        pendingAppointments: pendingCount || 0,
        thisMonthAppointments: monthCount || 0,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('載入資料失敗:' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  if (!clinic) {
    return (
      <div className="card">
        <h2 className="card-title">診所不存在</h2>
        <p style={{ color: '#6b7280' }}>找不到 ID 為 {clinicId} 的診所</p>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        {clinic.name}
      </h1>
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '2rem' }}>
        診所管理儀表板
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value">{stats.totalEmployees}</div>
              <div className="stat-label">員工總數</div>
            </div>
            <Users size={48} style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value">{stats.todayAttendance}</div>
              <div className="stat-label">今日打卡</div>
            </div>
            <Clock size={48} style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value">{stats.pendingAppointments}</div>
              <div className="stat-label">待確認預約</div>
            </div>
            <Calendar size={48} style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value">{stats.thisMonthAppointments}</div>
              <div className="stat-label">本月預約</div>
            </div>
            <TrendingUp size={48} style={{ opacity: 0.3 }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">診所資訊</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>診所名稱</div>
            <div style={{ fontWeight: '600', fontSize: '1.125rem' }}>{clinic.name}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>LINE Channel ID</div>
            <code style={{ fontSize: '0.875rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '0.25rem', display: 'block' }}>
              {clinic.linechannelid}
            </code>
          </div>
          <div>
            <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>管理員授權碼</div>
            <code style={{ fontSize: '0.875rem', background: '#fef3c7', padding: '0.5rem', borderRadius: '0.25rem', display: 'block', color: '#92400e' }}>
              {clinic.admin_code || '-'}
            </code>
          </div>
          <div>
            <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>狀態</div>
            <span className={`badge ${clinic.is_active ? 'badge-success' : 'badge-danger'}`}>
              {clinic.is_active ? '啟用中' : '已停用'}
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">快速操作</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = `/clinic/${clinicId}/employees`}
          >
            <Users size={20} />
            管理員工
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = `/clinic/${clinicId}/attendance`}
          >
            <Clock size={20} />
            查看打卡
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => window.location.href = `/clinic/${clinicId}/appointments`}
          >
            <Calendar size={20} />
            管理預約
          </button>
        </div>
      </div>
    </div>
  )
}
