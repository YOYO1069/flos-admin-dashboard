import { useState, useEffect } from 'react'
import { supabase, TABLES, AUTH_CODE_TYPES } from '../../lib/supabase'
import { Plus, Copy } from 'lucide-react'

export default function AuthCodesManagement() {
  const [authCodes, setAuthCodes] = useState([])
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: AUTH_CODE_TYPES.ATTENDANCE,
    clinic_id: '',
    expires_at: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // 獲取授權碼
      const { data: codesData, error: codesError } = await supabase
        .from(TABLES.AUTH_CODES)
        .select(`
          *,
          clinics (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })

      if (codesError) throw codesError

      // 獲取診所列表
      const { data: clinicsData, error: clinicsError } = await supabase
        .from(TABLES.CLINICS)
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (clinicsError) throw clinicsError

      setAuthCodes(codesData || [])
      setClinics(clinicsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('載入資料失敗:' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      // 生成授權碼
      const prefix = formData.type === AUTH_CODE_TYPES.ATTENDANCE ? 'ATT' : 'BOOK'
      const code = `${prefix}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
      
      const { error } = await supabase
        .from(TABLES.AUTH_CODES)
        .insert([{
          code,
          type: formData.type,
          clinic_id: formData.clinic_id || null,
          expires_at: formData.expires_at || null,
        }])

      if (error) throw error

      alert(`授權碼生成成功!\n授權碼: ${code}`)
      setFormData({ type: AUTH_CODE_TYPES.ATTENDANCE, clinic_id: '', expires_at: '' })
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Error creating auth code:', error)
      alert('生成失敗:' + error.message)
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    alert('已複製到剪貼簿!')
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
          授權碼管理
        </h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? '取消' : '生成授權碼'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="card-title">生成授權碼</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">授權碼類型</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value={AUTH_CODE_TYPES.ATTENDANCE}>打卡授權碼</option>
                <option value={AUTH_CODE_TYPES.BOOKING}>預約授權碼</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">所屬診所 (可選)</label>
              <select
                className="form-select"
                value={formData.clinic_id}
                onChange={(e) => setFormData({ ...formData, clinic_id: e.target.value })}
              >
                <option value="">不指定診所</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">過期時間 (可選)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">生成</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>授權碼</th>
                <th>類型</th>
                <th>所屬診所</th>
                <th>狀態</th>
                <th>使用時間</th>
                <th>過期時間</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {authCodes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    尚無授權碼
                  </td>
                </tr>
              ) : (
                authCodes.map((code) => {
                  const isExpired = code.expires_at && new Date(code.expires_at) < new Date()
                  return (
                    <tr key={code.id}>
                      <td>
                        <code style={{ fontSize: '0.875rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                          {code.code}
                        </code>
                      </td>
                      <td>
                        <span className={`badge ${code.type === AUTH_CODE_TYPES.ATTENDANCE ? 'badge-info' : 'badge-warning'}`}>
                          {code.type === AUTH_CODE_TYPES.ATTENDANCE ? '打卡' : '預約'}
                        </span>
                      </td>
                      <td>{code.clinics?.name || '-'}</td>
                      <td>
                        <span className={`badge ${code.is_used ? 'badge-success' : isExpired ? 'badge-danger' : 'badge-warning'}`}>
                          {code.is_used ? '已使用' : isExpired ? '已過期' : '未使用'}
                        </span>
                      </td>
                      <td>{code.used_at ? new Date(code.used_at).toLocaleString('zh-TW') : '-'}</td>
                      <td>{code.expires_at ? new Date(code.expires_at).toLocaleString('zh-TW') : '永久'}</td>
                      <td>{new Date(code.created_at).toLocaleString('zh-TW')}</td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => copyToClipboard(code.code)}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          <Copy size={16} />
                          複製
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
