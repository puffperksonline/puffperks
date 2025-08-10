import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwdsyxwvfefudcjbhrha.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZHN5eHd2ZmVmdWRjamJocmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzUyMzAsImV4cCI6MjA2OTcxMTIzMH0.h5Pn-0Q7JaQ5a-rl4X7lfycVPH-QdZB5KxSE0IW6cQA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);