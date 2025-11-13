import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, TABLES } from '../lib/supabase'
import { Calendar, Clock, User, Phone, FileText } from 'lucide-react'

export default function BookingForm() {
  const { clinicId } = useParams()
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    appointment_date: '',
    appointment_time: '',
    treatment: '',
    doctor: '',
    notes: '',
  })

  useEffect(() => {
    fetchClinic()
  }, [clinicId])

  async function fetchClinic() {
    try {
      const { data, error } = await supabase
        .from(TABLES.CLINICS)
        .select('*')
        .eq('id', clinicId)
        .single()

      if (error) throw error
      setClinic(data)
    } catch (error) {
      console.error('Error fetching clinic:', error)
      alert('載入診所資訊失敗')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabase
        .from(TABLES.APPOINTMENTS)
        .insert([{
          clinic_id: clinicId,
          ...formData,
          status: '待確認',
        }])

      if (error) throw error

      setSubmitted(true)
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert('預約失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>載入中...</div>
      </div>
    )
  }

  if (!clinic) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)' }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>診所不存在</div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '3rem', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#1e3a8a', fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>預約成功!</h1>
          <p style={{ color: '#6b7280', lineHeight: '1.8', marginBottom: '2rem' }}>
            我們已收到您的預約申請<br />
            診所人員將盡快與您聯繫確認
          </p>
          <div style={{ background: '#f3f4f6', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'left' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>診所:</strong> {clinic.name}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>姓名:</strong> {formData.customer_name}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>電話:</strong> {formData.customer_phone}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>日期:</strong> {formData.appointment_date}
            </div>
            <div>
              <strong>時間:</strong> {formData.appointment_time}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
          <h1 style={{ color: '#1e3a8a', fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            線上預約
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            {clinic.name}
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                姓名
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                聯絡電話
              </label>
              <input
                type="tel"
                className="form-input"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                預約日期
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.appointment_date}
                onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                預約時間
              </label>
              <input
                type="time"
                className="form-input"
                value={formData.appointment_time}
                onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                療程項目
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                placeholder="例如: 皮秒雷射、音波拉提"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">指定醫師 (可選)</label>
              <input
                type="text"
                className="form-input"
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                placeholder="如有指定醫師請填寫"
              />
            </div>

            <div className="form-group">
              <label className="form-label">備註 (可選)</label>
              <textarea
                className="form-input"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder="其他需求或注意事項"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}
            >
              {submitting ? '提交中...' : '確認預約'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
