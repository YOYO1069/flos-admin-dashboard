import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, TABLES, APPOINTMENT_STATUS } from '../../lib/supabase'
import { Download, Filter, Edit, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function ClinicAppointments() {
  const { clinicId } = useParams()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
    fetchAppointments()
  }, [clinicId])

  async function fetchAppointments() {
    try {
      let query = supabase
        .from(TABLES.APPOINTMENTS)
        .select('*')
        .eq('clinic_id', clinicId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.date_from) {
        query = query.gte('appointment_date', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('appointment_date', filters.date_to)
      }

      const { data, error } = await query.limit(100)

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      alert('載入預約記錄失敗:' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      const { error } = await supabase
        .from(TABLES.APPOINTMENTS)
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('更新失敗:' + error.message)
    }
  }

  async function deleteAppointment(id) {
    if (!confirm('確定要刪除此預約嗎?')) return

    try {
      const { error } = await supabase
        .from(TABLES.APPOINTMENTS)
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('刪除失敗:' + error.message)
    }
  }

  function getStatusBadge(status) {
    const statusMap = {
      [APPOINTMENT_STATUS.PENDING]: 'badge-warning',
      [APPOINTMENT_STATUS.CONFIRMED]: 'badge-info',
      [APPOINTMENT_STATUS.COMPLETED]: 'badge-success',
      [APPOINTMENT_STATUS.CANCELLED]: 'badge-danger',
      [APPOINTMENT_STATUS.NO_SHOW]: 'badge-danger',
    }
    return statusMap[status] || 'badge-info'
  }

  function exportToExcel() {
    const data = appointments.map(apt => ({
      '客戶姓名': apt.customer_name,
      '客戶電話': apt.customer_phone,
      '預約日期': apt.appointment_date,
      '預約時間': apt.appointment_time,
      '療程': apt.treatment,
      '醫師': apt.doctor || '-',
      '狀態': apt.status,
      '備註': apt.notes || '-',
      '建立時間': new Date(apt.created_at).toLocaleString('zh-TW'),
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '預約記錄')
    XLSX.writeFile(wb, `預約記錄_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
          預約管理
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
            <label className="form-label">狀態</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">全部狀態</option>
              {Object.values(APPOINTMENT_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
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
            <button className="btn btn-primary" onClick={fetchAppointments} style={{ width: '100%' }}>
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
                <th>客戶姓名</th>
                <th>客戶電話</th>
                <th>預約日期</th>
                <th>預約時間</th>
                <th>療程</th>
                <th>醫師</th>
                <th>狀態</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    尚無預約記錄
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td style={{ fontWeight: '600' }}>{apt.customer_name}</td>
                    <td>{apt.customer_phone}</td>
                    <td>{apt.appointment_date}</td>
                    <td>{apt.appointment_time}</td>
                    <td>{apt.treatment}</td>
                    <td>{apt.doctor || '-'}</td>
                    <td>
                      <select
                        className="form-select"
                        value={apt.status}
                        onChange={(e) => updateStatus(apt.id, e.target.value)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        {Object.values(APPOINTMENT_STATUS).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteAppointment(apt.id)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <Trash2 size={16} />
                        刪除
                      </button>
                    </td>
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
