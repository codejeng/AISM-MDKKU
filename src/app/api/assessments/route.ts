import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');

    let query = supabase
      .from('assessments')
      .select('*, patients(name, hn)')
      .order('created_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;

    if (error) {
       console.warn('Supabase fetch error for assessments:', error.message);
       return NextResponse.json([]);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_id, patient_name, patient_hn, assessor_name, total_mrss, notes, sites } = body;

    let finalPatientId = patient_id;

    if (!finalPatientId) {
      if (!patient_name || !patient_hn) {
        return NextResponse.json(
          { error: 'Patient ID or Patient Name/HN is required' },
          { status: 400 }
        );
      }

      // Create new patient on the fly
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          name: patient_name,
          hn: patient_hn,
        })
        .select()
        .single();

      if (patientError) throw patientError;
      finalPatientId = newPatient.id;
    }

    // Create assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        patient_id: finalPatientId,
        assessor_name: assessor_name || 'Unknown',
        total_mrss: total_mrss || 0,
        notes: notes || null,
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Insert site scores
    if (sites && Array.isArray(sites) && sites.length > 0) {
      const siteRecords = sites.map((site: {
        site_name: string;
        site_label: string;
        image_url?: string;
        ai_score?: number;
        manual_score?: number;
        confidence?: number;
      }) => ({
        assessment_id: assessment.id,
        site_name: site.site_name,
        site_label: site.site_label,
        image_url: site.image_url || null,
        ai_score: site.ai_score ?? null,
        manual_score: site.manual_score ?? null,
        confidence: site.confidence ?? null,
      }));

      const { error: sitesError } = await supabase
        .from('assessment_sites')
        .insert(siteRecords);

      if (sitesError) throw sitesError;
    }

    return NextResponse.json(assessment, { status: 201 });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
