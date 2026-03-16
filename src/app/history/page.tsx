'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';

interface AssessmentWithPatient {
  id: string;
  patient_id: string;
  assessor_name: string;
  total_mrss: number;
  notes: string | null;
  created_at: string;
  patients?: { name: string; hn: string };
}

export default function HistoryPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<AssessmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assessments');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAssessments(data);
    } catch (err) {
      setError('Unable to load history. Please check your Supabase configuration.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityConfig = (score: number) => {
    if (score === 0) return { label: 'Normal', color: '#4CAF50', bgColor: '#E8F5E9' };
    if (score <= 10) return { label: 'Mild', color: '#FF9800', bgColor: '#FFF3E0' };
    if (score <= 25) return { label: 'Moderate', color: '#F44336', bgColor: '#FFEBEE' };
    return { label: 'Severe', color: '#9C27B0', bgColor: '#F3E5F5' };
  };

  const filtered = assessments.filter((a) => {
    const patientName = a.patients?.name?.toLowerCase() || '';
    const patientHn = a.patients?.hn?.toLowerCase() || '';
    const q = search.toLowerCase();
    return patientName.includes(q) || patientHn.includes(q);
  });

  return (
    <AppLayout title="History">
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <TextField
          fullWidth
          placeholder="Search by patient name or HN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>📋</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {search ? 'No assessments found' : 'No assessments yet'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((assessment) => {
              const severity = getSeverityConfig(assessment.total_mrss);
              return (
                <Card
                  key={assessment.id}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                    },
                  }}
                  onClick={() => router.push(`/assessment/${assessment.id}`)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {assessment.patients?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          HN: {assessment.patients?.hn || '-'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(assessment.created_at).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>

                      <Box sx={{ textAlign: 'right' }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                            bgcolor: severity.bgColor,
                          }}
                        >
                          <TrendingIcon sx={{ fontSize: 16, color: severity.color }} />
                          <Typography variant="h6" fontWeight={800} sx={{ color: severity.color }}>
                            {assessment.total_mrss}
                          </Typography>
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {severity.label}
                        </Typography>
                      </Box>
                    </Box>

                    {assessment.notes && (
                      <>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="caption" color="text.secondary" noWrap>
                          📝 {assessment.notes}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </AppLayout>
  );
}
