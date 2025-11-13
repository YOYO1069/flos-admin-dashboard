export default function Statistics() {
  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>
        統計分析
      </h1>

      <div className="card">
        <h2 className="card-title">功能開發中</h2>
        <p style={{ color: '#6b7280', lineHeight: '1.8' }}>
          統計分析功能正在開發中,將包括:
        </p>
        <ul style={{ marginLeft: '2rem', marginTop: '1rem', color: '#6b7280', lineHeight: '2' }}>
          <li>各診所打卡統計圖表</li>
          <li>各診所預約統計圖表</li>
          <li>員工出勤率分析</li>
          <li>預約完成率分析</li>
          <li>趨勢分析</li>
        </ul>
      </div>
    </div>
  )
}
