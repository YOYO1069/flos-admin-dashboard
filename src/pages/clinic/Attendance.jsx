import { useParams } from 'react-router-dom'

export default function ClinicAttendance() {
  const { clinicId } = useParams()
  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        打卡記錄 (診所 ID: {clinicId})
      </h1>
      <div className="card">
        <p style={{ color: '#6b7280' }}>功能開發中...</p>
      </div>
    </div>
  )
}
