import { useState, useEffect } from 'react'
import { supabase, TABLES } from '../../lib/supabase'
import { Building2, Users, Clock, Calendar } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalClinics: 0,
    totalEmployees: 0,
    todayAttendance: 0,
    pendingAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // 獲取診所總數
      const { count: clinicsCount } = await supabase
        .from(TABLES.CLINICS)
        .select('*', { count: 'exact', head: true })

      // 獲取員工總數
      const { count: employeesCount } = await supabase
        .from(TABLES.EMPLOYEES)
        .select('*', { count: 'exact', head: true })

      // 獲取今日打卡數
      const today = new Date().toISOString().split('T')[0]
      const { count: attendanceCount } = await supabase
        .from(TABLES.ATTENDANCE_RECORDS)
        .select('*', { count: 'exact', head: true })
        .gte('check_in_time', `${today}T00:00:00`)
        .lte('check_in_time', `${today}T23:59:59`)

      // 獲取待確認預約數
      const { count: appointmentsCount } = await supabase
        .from(TABLES.APPOINTMENTS)
        .select('*', { count: 'exact', head: true })
        .eq('status', '待確認')

      setStats({
        totalClinics: clinicsCount || 0,
        totalEmployees: employeesCount || 0,
        todayAttendance: attendanceCount || 0,
        pendingAppointments: appointmentsCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        超級管理員儀表板
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="stat-value">{stats.totalClinics}</div>
              <div className="stat-label">診所總數</div>
            </div>
            <Building2 size={48} style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
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
      </div>

      <div className="card">
        <h2 className="card-title">系統說明</h2>
        <div style={{ lineHeight: '1.8', color: '#4b5563' }}>
          <p style={{ marginBottom: '1rem' }}>
            歡迎使用 FLOS 統一管理系統。本系統整合了打卡管理和預約管理兩大核心功能。
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>主要功能:</strong>
          </p>
          <ul style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
            <li>診所管理:新增、查看、管理所有診所</li>
            <li>授權碼管理:核發打卡和預約授權碼</li>
            <li>打卡總覽:查看所有診所的打卡記錄</li>
            <li>預約總覽:查看所有診所的預約記錄</li>
            <li>統計分析:查看系統使用統計</li>
          </ul>
          <p>
            請使用上方導航列切換不同功能頁面。
          </p>
        </div>
      </div>
    </div>
  )
}
