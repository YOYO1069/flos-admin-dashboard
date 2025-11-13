-- FLOS 統一管理系統資料庫結構
-- 版本: 2.0.0
-- 建立日期: 2025年11月13日

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
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  line_user_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  employee_code VARCHAR(50) UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 打卡記錄表
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 預約記錄表
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
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
  type VARCHAR(20) NOT NULL CHECK (type IN ('attendance', 'booking')),
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE SET NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_employees_clinic_id ON employees(clinic_id);
CREATE INDEX IF NOT EXISTS idx_employees_line_user_id ON employees(line_user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_time ON attendance_records(check_in_time);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON auth_codes(code);
CREATE INDEX IF NOT EXISTS idx_auth_codes_type ON auth_codes(type);

-- 註解說明
COMMENT ON TABLE clinics IS '診所資料表';
COMMENT ON TABLE employees IS '員工資料表';
COMMENT ON TABLE attendance_records IS '打卡記錄表';
COMMENT ON TABLE appointments IS '預約記錄表';
COMMENT ON TABLE auth_codes IS '授權碼表';

COMMENT ON COLUMN clinics.linechannelid IS 'LINE 群組 ID';
COMMENT ON COLUMN clinics.admin_code IS '管理員授權碼';
COMMENT ON COLUMN employees.line_user_id IS 'LINE User ID';
COMMENT ON COLUMN employees.employee_code IS '員工編號';
COMMENT ON COLUMN attendance_records.check_in_time IS '上班打卡時間';
COMMENT ON COLUMN attendance_records.check_out_time IS '下班打卡時間';
COMMENT ON COLUMN auth_codes.type IS '授權碼類型: attendance(打卡) 或 booking(預約)';
COMMENT ON COLUMN auth_codes.expires_at IS '授權碼過期時間';
