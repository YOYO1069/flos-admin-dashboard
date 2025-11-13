import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, TABLES } from '../../lib/supabase'
import { Power } from 'lucide-react'

export default function ClinicEmployees() {
  const { clinicId } = useParams()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [clinicId])

  async function fetchEmployees() {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMPLOYEES)
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
      alert('載入員工資料失敗:' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(id, currentStatus) {
    try {
      const { error } = await supabase
        .from(TABLES.EMPLOYEES)
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchEmployees()
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('更新失敗:' + error.message)
    }
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        員工管理
      </h1>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>員工姓名</th>
                <th>員工編號</th>
                <th>LINE User ID</th>
                <th>狀態</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    尚無員工資料
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td style={{ fontWeight: '600' }}>{employee.name}</td>
                    <td>
                      <code style={{ fontSize: '0.875rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                        {employee.employee_code || '-'}
                      </code>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.875rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                        {employee.line_user_id}
                      </code>
                    </td>
                    <td>
                      <span className={`badge ${employee.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {employee.is_active ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td>{new Date(employee.created_at).toLocaleString('zh-TW')}</td>
                    <td>
                      <button
                        className={`btn ${employee.is_active ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleActive(employee.id, employee.is_active)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <Power size={16} />
                        {employee.is_active ? '停用' : '啟用'}
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
