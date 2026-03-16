-- =====================================================
-- AISM-MDKKU: SSc Skin Assessment Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  hn TEXT NOT NULL,
  age INTEGER,
  gender TEXT CHECK (gender IN ('M', 'F')),
  diagnosis_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assessor_name TEXT DEFAULT 'Unknown',
  total_mrss INTEGER DEFAULT 0 CHECK (total_mrss >= 0 AND total_mrss <= 51),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment sites table (17 body sites per assessment)
CREATE TABLE IF NOT EXISTS assessment_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  site_label TEXT NOT NULL,
  image_url TEXT,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 3),
  manual_score INTEGER CHECK (manual_score >= 0 AND manual_score <= 3),
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sites_assessment ON assessment_sites(assessment_id);
CREATE INDEX IF NOT EXISTS idx_patients_hn ON patients(hn);

-- Row Level Security (RLS) - enable for production
-- ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assessment_sites ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon (development mode)
-- For production, replace with proper policies
CREATE POLICY "Allow all for patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all for assessments" ON assessments FOR ALL USING (true);
CREATE POLICY "Allow all for assessment_sites" ON assessment_sites FOR ALL USING (true);
