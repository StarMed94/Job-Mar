import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided in .env file");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// أنواع البيانات للتطبيق
export type UserRole = 'candidate' | 'employer' | 'admin';
export type JobType = 'fulltime' | 'freelance';
export type ApplicationStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired';
export type WorkMode = 'freelance' | 'fulltime' | 'both';
export type LocationMode = 'onsite' | 'remote' | 'hybrid';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  headline?: string;
  bio?: string;
  skills: string[];
  experience_years: number;
  work_modes: WorkMode[];
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  location?: string;
  portfolio_links: string[];
  cv_url?: string;
  availability: boolean;
  user?: User;
}

export interface Company {
  id: string;
  owner_user_id: string;
  name: string;
  about?: string;
  website?: string;
  logo_url?: string;
  size_range?: string;
  location?: string;
  verified: boolean;
  owner?: User;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  type: JobType;
  description: string;
  requirements?: string;
  skills: string[];
  seniority_level?: string;
  location_mode: LocationMode;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  company?: Company;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cv_url?: string;
  cover_letter?: string;
  portfolio_links: string[];
  created_at: string;
  job?: Job;
  candidate?: Candidate;
}
