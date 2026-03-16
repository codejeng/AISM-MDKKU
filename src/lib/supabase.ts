import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!supabaseUrl || supabaseUrl === 'your-supabase-url' || !supabaseAnonKey || supabaseAnonKey === 'your-supabase-anon-key') {
      // Return a dummy client that will gracefully fail
      // This allows the app to build and run without Supabase configured
      _supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
    } else {
      _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }
  return _supabase;
}

// Convenience getter
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    const client = getSupabase();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// Types for our database tables
export interface Patient {
  id: string;
  name: string;
  hn: string;
  age: number;
  gender: string;
  diagnosis_date: string | null;
  created_at: string;
}

export interface Assessment {
  id: string;
  patient_id: string;
  assessor_name: string;
  total_mrss: number;
  notes: string | null;
  created_at: string;
  patient?: Patient;
}

export interface AssessmentSite {
  id: string;
  assessment_id: string;
  site_name: string;
  site_label: string;
  image_url: string | null;
  ai_score: number | null;
  manual_score: number | null;
  confidence: number | null;
  created_at: string;
}
