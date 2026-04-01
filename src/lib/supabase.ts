import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dhaaaltbnegnocehutlv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoYWFhbHRibmVnbm9jZWh1dGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMzk1NTcsImV4cCI6MjA5MDYxNTU1N30.TBkz1AX6o8JnFsleg2lFAxpCrLTdEPxr0tdTss4y3Yc';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
