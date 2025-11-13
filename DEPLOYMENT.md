# FLOS Admin Dashboard 部署指南

## 🚀 Netlify 部署步驟

### 1. 登入 Netlify
前往 https://app.netlify.com/

### 2. 匯入 GitHub Repository
1. 點擊 "Add new site" → "Import an existing project"
2. 選擇 "GitHub"
3. 搜尋並選擇 `YOYO1069/flos-admin-dashboard`

### 3. 設定建置參數
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 4. 設定環境變數
在 "Environment variables" 中新增:

```
VITE_SUPABASE_URL=https://clzjdlykhjwrlksyjlfz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsempkbHlraGp3cmxrc3lqbGZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3OTM2ODAsImV4cCI6MjA3NTM2OTY4MH0.V6QAoh4N2aSF5CgDYfKTnY8cMQnDV3AYilj7TbpWJcU
```

### 5. 部署
點擊 "Deploy site" 開始部署

---

## 🗄️ 資料庫設定

### 需要建立的資料表

執行以下 SQL 在 Supabase:

\`\`\`sql
-- 診所表
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  linechannelid VARCHAR(255) UNIQUE NOT NULL,
  admin_code VARCHAR(50) UNIQUE,
  dashboard_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 員工表
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id),
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 打卡記錄表
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id),
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 預約記錄表
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  treatment VARCHAR(255) NOT NULL,
  doctor VARCHAR(255),
  status VARCHAR(50) DEFAULT '待確認',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 授權碼表
CREATE TABLE IF NOT EXISTS auth_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL,
  clinic_id INTEGER REFERENCES clinics(id),
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
\`\`\`

---

## 📋 功能說明

### 超級管理員功能
- `/admin` - 總覽儀表板
- `/admin/clinics` - 診所管理
- `/admin/auth-codes` - 授權碼管理
- `/admin/attendance` - 打卡總覽
- `/admin/appointments` - 預約總覽
- `/admin/statistics` - 統計分析

### 診所管理員功能
- `/clinic/{clinicId}` - 診所總覽
- `/clinic/{clinicId}/employees` - 員工管理
- `/clinic/{clinicId}/attendance` - 打卡記錄
- `/clinic/{clinicId}/appointments` - 預約管理

---

## 🔧 本地開發

\`\`\`bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置
npm run build

# 預覽建置結果
npm run preview
\`\`\`

---

## 📝 注意事項

1. 確保 Supabase 資料庫已建立所有必要的資料表
2. 確保環境變數正確設定
3. 首次使用需要先新增診所資料
4. 授權碼需要先生成才能讓員工綁定

---

**版本**: 2.0.0  
**建立日期**: 2025年11月13日
