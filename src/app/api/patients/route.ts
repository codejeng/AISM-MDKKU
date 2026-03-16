import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error.message);
      return NextResponse.json([]); // Graceful fallback
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json([]); // Graceful fallback if completely unconfigured
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, hn, age, gender, diagnosis_date } = body;

    if (!name || !hn) {
      return NextResponse.json(
        { error: 'Name and HN are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('patients')
      .insert({
        name,
        hn,
        age: age || null,
        gender: gender || null,
        diagnosis_date: diagnosis_date || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
