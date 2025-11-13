import { useParams } from 'react-router-dom'

export default function ClinicDashboard() {
  const { clinicId } = useParams()

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        診所總覽 (ID: {clinicId})
      </h1>

      <div className="card">
        <h2 className="card-title">診所儀表板</h2>
        <p style={{ color: '#6b7280', lineHeight: '1.8' }}>
          診所管理員儀表板功能開發中...
        </p>
      </div>
    </div>
  )
}
