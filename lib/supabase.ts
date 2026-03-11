import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dghczkwqibkuxpdezwbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaGN6a3dxaWJrdXhwZGV6d2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMzMzNjksImV4cCI6MjA4ODgwOTM2OX0.J8x7KEARdGKbu3xanX79u_DbGxbvO2IVHkcKo2V9p7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
});
