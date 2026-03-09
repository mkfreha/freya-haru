import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zgtenpqyeiguvtwwkgpg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpndGVucHF5ZWlndXZ0d3drZ3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTc4MjEsImV4cCI6MjA4ODYzMzgyMX0.HaHR00ZrbFDmAx8t70EdIlZ8YSuZuLQC0V6Ex1FJCSY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export function localDate(d) {
  const dt = d || new Date()
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
}
