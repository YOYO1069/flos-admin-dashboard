import { useState, useEffect } from 'react'
import { supabase, TABLES } from '../../lib/supabase'
import { Plus, Eye, Power } from 'lucide-react'

export default function ClinicsManagement() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    linechannelid: '',
  })

  useEffect(() => {
    fetchClinics()
  }, [])

  async function fetchClinics() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLINICS)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setClinics(data || [])
    } catch (error) {
      console.error('Error fetching clinics:', error)
      alert('載入診所資料失敗:' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      // 生成管理員授權碼
      const adminCode = 'ADMIN-' + Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { error } = await supabase
        .from(TABLES.CLINICS)
        .insert([{
          ...formData,
          admin_code: adminCode,
        }])

      if (error) throw error

      alert(`診所新增成功!\n管理員授權碼: ${adminCode}`)
      setFormData({ name: '', linechannelid: '' })
      setShowForm(false)
      fetchClinics()
    } catch (error) {
      console.error('Error creating clinic:', error)
      alert('新增失敗:' + error.message)
    }
  }

  async function toggleActive(id, currentStatus) {
    try {
      const { error } = await supabase
        .from(TABLES.CLINICS)
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchClinics()
    } catch (error) {
      console.error('Error updating clinic:', error)
      alert('更新失敗:' + error.message)
    }
  }

  if (loading) {
    return <div className="loading">載入中...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', margin: 0 }}>
          診所管理
        </h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} />
          {showForm ? '取消' : '新增診所'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="card-title">新增診所</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">診所名稱</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">LINE 群組 ID</label>
              <input
                type="text"
                className="form-input"
                value={formData.linechannelid}
                onChange={(e) => setFormData({ ...formData, linechannelid: e.target.value })}
                placeholder="例如: C1234567890abcdef..."
                required
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                將 Bot 加入群組後,從 Runtime Logs 中取得 groupId
              </small>
            </div>
            <button type="submit" className="btn btn-primary">新增</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>診所名稱</th>
                <th>LINE Channel ID</th>
                <th>管理員授權碼</th>
                <th>狀態</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {clinics.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    尚無診所資料
                  </td>
                </tr>
              ) : (
                clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td>{clinic.id}</td>
                    <td style={{ fontWeight: '600' }}>{clinic.name}</td>
                    <td><code style={{ fontSize: '0.875rem', background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>{clinic.linechannelid}</code></td>
                    <td><code style={{ fontSize: '0.875rem', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: '#92400e' }}>{clinic.admin_code || '-'}</code></td>
                    <td>
                      <span className={`badge ${clinic.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {clinic.is_active ? '啟用' : '停用'}
                      </span>
                    </td>
                    <td>{new Date(clinic.created_at).toLocaleString('zh-TW')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => window.open(`/clinic/${clinic.id}`, '_blank')}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          <Eye size={16} />
                          查看
                        </button>
                        <button
                          className={`btn ${clinic.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleActive(clinic.id, clinic.is_active)}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                        >
                          <Power size={16} />
                          {clinic.is_active ? '停用' : '啟用'}
                        </button>
                      </div>
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
