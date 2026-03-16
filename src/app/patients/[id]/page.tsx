'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  AddAPhoto as AssessIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';
import { type Patient, type Assessment } from '@/lib/supabase';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientData();
  }, [params.id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      // Fetch patient and assessments in parallel
      const [patientRes, assessmentsRes] = await Promise.all([
        fetch(`/api/patients`),
        fetch(`/api/assessments?patient_id=${params.id}`),
      ]);

      if (patientRes.ok) {
        const patients = await patientRes.json();
        const found = patients.find((p: Patient) => p.id === params.id);
        setPatient(found || null);
      }

      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data);
      }
    } catch (err) {
      setError('Failed to load patient data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Patient" showBack>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (!patient) {
    return (
      <AppLayout title="Patient" showBack>
        <Alert severity="error">Patient not found</Alert>
      </AppLayout>
    );
  }

  const getSeverityColor = (score: number) => {
    if (score === 0) return '#4CAF50';
    if (score <= 10) return '#FF9800';
    if (score <= 25) return '#F44336';
    return '#9C27B0';
  };

  return (
    <AppLayout title={patient.name} showBack>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Patient Info Card */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: patient.gender === 'F' ? '#E91E63' + '20' : '#2196F3' + '20',
                  color: patient.gender === 'F' ? '#E91E63' : '#2196F3',
                }}
              >
                <PersonIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {patient.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label={`HN: ${patient.hn}`} size="small" variant="outlined" />
                  <Chip label={`${patient.age} yrs`} size="small" />
                  <Chip label={patient.gender === 'F' ? 'Female' : 'Male'} size="small" />
                </Box>
              </Box>
            </Box>

            {patient.diagnosis_date && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CalendarIcon fontSize="small" />
                <Typography variant="body2">
                  Diagnosed: {new Date(patient.diagnosis_date).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* New Assessment Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<AssessIcon />}
          onClick={() => router.push(`/assessment/new?patient_id=${patient.id}`)}
          sx={{
            mb: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 100%)',
          }}
        >
          Start New Assessment
        </Button>

        {/* Assessment History */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
          Assessment History ({assessments.length})
        </Typography>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {assessments.length === 0 ? (
          <Card sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" sx={{ mb: 1 }}>📋</Typography>
              <Typography variant="body2" color="text.secondary">
                No assessments yet
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {assessments.map((assessment) => (
              <Card
                key={assessment.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { transform: 'translateY(-1px)' },
                }}
                onClick={() => router.push(`/assessment/${assessment.id}`)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(assessment.created_at).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        By: {assessment.assessor_name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ color: getSeverityColor(assessment.total_mrss) }}
                      >
                        {assessment.total_mrss}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        / 51
                      </Typography>
                    </Box>
                  </Box>
                  {assessment.notes && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {assessment.notes}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </AppLayout>
  );
}
