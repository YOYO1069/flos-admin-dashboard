import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 資料庫表名常數
export const TABLES = {
  CLINICS: 'clinics',
  EMPLOYEES: 'employees',
  ATTENDANCE_RECORDS: 'attendance_records',
  APPOINTMENTS: 'appointments',
  CUSTOMERS: 'customers',
  TREATMENTS: 'treatments',
  AUTH_CODES: 'auth_codes',
}

// 授權碼類型
export const AUTH_CODE_TYPES = {
  ATTENDANCE: 'attendance',
  BOOKING: 'booking',
}

// 預約狀態
export const APPOINTMENT_STATUS = {
  PENDING: '待確認',
  CONFIRMED: '已確認',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  NO_SHOW: '未到',
}
