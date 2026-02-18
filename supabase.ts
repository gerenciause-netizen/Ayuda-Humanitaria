
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mbfdwfjuvqxbvrggvolu.supabase.co';
// Clave Anon Pública proporcionada por el usuario para el proyecto mbfdwfjuvqxbvrggvolu
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1iZmR3Zmp1dnF4YnZyZ2d2b2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNjY4MzAsImV4cCI6MjA4Njk0MjgzMH0.HOSQscux7kfWOK_z0nqzPvRY8y6xgtkiF05BZx1CYDc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false
  }
});
