import { useState, useEffect } from 'react'
import { supabase, TABLES } from '../../lib/supabase'
import { Download, Filter } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function AttendanceOverview() {
  const [records, setRecords] = useState([])
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    clinic_id: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // 獲取診所列表
      const { data: clinicsData } = await supabase
        .from(TABLES.CLINICS)
        .select('id, name')
        .order('name')

      setClinics(clinicsData || [])

      // 獲取打卡記錄
      await fetchRecords()
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('載入資料失敗:' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function fetchRecords() {
    try {
      let query = supabase
        .from(TABLES.ATTENDANCE_RECORDS)
        .select(`
          *,
          employees (
            id,
            name,
            employee_code,
            clinics (
              id,
              name
            )
          )
        `)
        .order('check_in_time', { ascending: false })

      // 應用篩選
      if (filters.clinic_id) {
        query = query.eq('employees.clinic_id', filters.clinic_id)
      }
      if (filters.date_from) {
        query = query.gte('check_in_time', `${filters.date_from}T00:00:00`)
      }
      if (filters.date_to) {
        query = query.lte('check_in_time', `${filters.date_to}T23:59:59`)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
      alert('載入打卡記錄失敗:' + error.message)
    }
  }

  function calculateWorkHours(checkIn, checkOut) {
    if (!checkOut) return '-'
    const diff = new Date(checkOut) - new Date(checkIn)
    const hours = Math.floor(diff / 1000 / 60 / 60)
    const minutes = Math.floor((diff / 1000 / 60) % 60)
    return `${hours}小時${minutes}分鐘`
  }

  function exportToExcel() {
    const data = records.map(record => ({
      '診所': record.employees?.clinics?.name || '-',
      '員工姓名': record.employees?.name || '-',
      '員工編號': record.employees?.employee_code || '-',
      '上班時間': new Date(record.check_in_time).toLocaleString('zh-TW'),
      '下班時間': record.check_out_time ? new Date(record.check_out_time).toLocaleString('zh-TW') : '尚未打卡',
      '工作時數': calculateWorkHours(record.check_in_time, record.check_out_time),
      '打卡地點': record.location || '-',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '打卡記錄')
    XLSX.writeFile(wb, `打卡記錄_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
          打卡總覽
        </h1>
        <button className="btn btn-success" onClick={exportToExcel}>
          <Download size={20} />
          匯出 Excel
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#1e3a8a', fontWeight: '600' }}>
          <Filter size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
          篩選條件
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">診所</label>
            <select
              className="form-select"
              value={filters.clinic_id}
              onChange={(e) => setFilters({ ...filters, clinic_id: e.target.value })}
            >
              <option value="">全部診所</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">開始日期</label>
            <input
              type="date"
              className="form-input"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">結束日期</label>
            <input
              type="date"
              className="form-input"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={fetchRecords} style={{ width: '100%' }}>
              套用篩選
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>診所</th>
                <th>員工姓名</th>
                <th>員工編號</th>
                <th>上班時間</th>
                <th>下班時間</th>
                <th>工作時數</th>
                <th>打卡地點</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    尚無打卡記錄
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.employees?.clinics?.name || '-'}</td>
                    <td style={{ fontWeight: '600' }}>{record.employees?.name || '-'}</td>
                    <td><code style={{ fontSize: '0.875rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{record.employees?.employee_code || '-'}</code></td>
                    <td>{new Date(record.check_in_time).toLocaleString('zh-TW')}</td>
                    <td>
                      {record.check_out_time ? (
                        new Date(record.check_out_time).toLocaleString('zh-TW')
                      ) : (
                        <span className="badge badge-warning">尚未打卡</span>
                      )}
                    </td>
                    <td>{calculateWorkHours(record.check_in_time, record.check_out_time)}</td>
                    <td>{record.location || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
