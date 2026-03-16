'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import AppLayout from '@/components/Layout/AppLayout';
import AssessmentSummary from '@/components/AssessmentSummary';
import ScoreCard from '@/components/ScoreCard';
import { type Assessment, type AssessmentSite } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export default function AssessmentDetailPage() {
  const params = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [sites, setSites] = useState<AssessmentSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessment();
  }, [params.id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);

      // Fetch assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*, patients(name, hn)')
        .eq('id', params.id)
        .single();

      if (assessmentError) throw assessmentError;
      setAssessment(assessmentData);

      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('assessment_sites')
        .select('*')
        .eq('assessment_id', params.id)
        .order('created_at');

      if (sitesError) throw sitesError;
      setSites(sitesData || []);
    } catch (err) {
      setError('Failed to load assessment details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Assessment" showBack>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (!assessment) {
    return (
      <AppLayout title="Assessment" showBack>
        <Alert severity="error">Assessment not found</Alert>
      </AppLayout>
    );
  }

  const patientInfo = assessment.patient as unknown as { name: string; hn: string } | undefined;

  return (
    <AppLayout title="Assessment Results" showBack>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Patient Info */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {patientInfo?.name || 'Unknown Patient'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  HN: {patientInfo?.hn || '-'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(assessment.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  By: {assessment.assessor_name}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Summary */}
        <AssessmentSummary
          siteResults={sites.map((s) => ({
            site_name: s.site_name,
            site_label: s.site_label,
            ai_score: s.ai_score,
            manual_score: s.manual_score,
            image_url: s.image_url,
            confidence: s.confidence,
          }))}
          totalMrss={assessment.total_mrss}
        />

        {/* Site Details */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1.5 }}>
          Site Details ({sites.length} sites)
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {sites.map((site) => (
            <ScoreCard
              key={site.id}
              siteLabel={site.site_label}
              imageUrl={site.image_url}
              aiScore={site.ai_score}
              manualScore={site.manual_score}
              confidence={site.confidence}
            />
          ))}
        </Box>

        {/* Notes */}
        {assessment.notes && (
          <Card sx={{ mt: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
                Notes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assessment.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </AppLayout>
  );
}
