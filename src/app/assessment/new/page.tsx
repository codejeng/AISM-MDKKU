'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Slide,
  Autocomplete,
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as DoneIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';
import BodySiteSelector from '@/components/BodySiteSelector';
import CameraCapture from '@/components/CameraCapture';
import ScoreCard from '@/components/ScoreCard';
import AssessmentSummary from '@/components/AssessmentSummary';
import { BODY_SITES, type BodySite } from '@/lib/bodySites';
import { fileToBase64, predictSkinScore, SCORE_CONFIG } from '@/lib/huggingface';
import { type Patient } from '@/lib/supabase';

interface SiteData {
  site_name: string;
  site_label: string;
  image_url: string | null;
  image_file: File | null;
  ai_score: number | null;
  manual_score: number | null;
  confidence: number | null;
}

const STEPS = ['Select Patient', 'Photograph Sites', 'Review & Save'];

function NewAssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get('patient_id');

  const [activeStep, setActiveStep] = useState(preselectedPatientId ? 1 : 0);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientHn, setPatientHn] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [assessorName, setAssessorName] = useState('');
  const [notes, setNotes] = useState('');

  // Site assessment data
  const [siteData, setSiteData] = useState<Record<string, SiteData>>({});
  const [selectedSite, setSelectedSite] = useState<BodySite | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize site data
  useEffect(() => {
    const initial: Record<string, SiteData> = {};
    BODY_SITES.forEach((site) => {
      initial[site.name] = {
        site_name: site.name,
        site_label: site.label,
        image_url: null,
        image_file: null,
        ai_score: null,
        manual_score: null,
        confidence: null,
      };
    });
    setSiteData(initial);
  }, []);

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);

        if (preselectedPatientId) {
          const found = data.find((p: Patient) => p.id === preselectedPatientId);
          if (found) {
            setSelectedPatient(found);
            setPatientName(found.name);
            setPatientHn(found.hn);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const handleCapture = (file: File, previewUrl: string) => {
    if (!selectedSite) return;
    setSiteData((prev) => ({
      ...prev,
      [selectedSite.name]: {
        ...prev[selectedSite.name],
        image_url: previewUrl,
        image_file: file,
        ai_score: null,
        manual_score: null,
        confidence: null,
      },
    }));
  };

  const handleAnalyze = async () => {
    if (!selectedSite || !siteData[selectedSite.name]?.image_file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const base64 = await fileToBase64(siteData[selectedSite.name].image_file!);
      const result = await predictSkinScore(base64);

      setSiteData((prev) => ({
        ...prev,
        [selectedSite.name]: {
          ...prev[selectedSite.name],
          ai_score: result.score,
          confidence: result.confidence,
        },
      }));
      setShowResults(true);
    } catch (err) {
      setError('Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleOverrideScore = (score: number) => {
    if (!selectedSite) return;
    setSiteData((prev) => ({
      ...prev,
      [selectedSite.name]: {
        ...prev[selectedSite.name],
        manual_score: score,
      },
    }));
  };

  const handleSaveAssessment = async () => {
    if (!patientName || !patientHn) return;

    setSaving(true);
    setError(null);

    try {
      const completedSites = Object.values(siteData).filter(
        (s) => s.ai_score !== null || s.manual_score !== null
      );

      const totalMrss = completedSites.reduce((sum, s) => {
        return sum + (s.manual_score ?? s.ai_score ?? 0);
      }, 0);

      const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient?.id,
          patient_name: patientName,
          patient_hn: patientHn,
          assessor_name: assessorName || 'Unknown',
          total_mrss: totalMrss,
          notes: notes || null,
          sites: Object.values(siteData).map((s) => ({
            site_name: s.site_name,
            site_label: s.site_label,
            image_url: s.image_url,
            ai_score: s.ai_score,
            manual_score: s.manual_score,
            confidence: s.confidence,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const assessment = await res.json();
      router.push(`/assessment/${assessment.id}`);
    } catch (err) {
      setError('Failed to save assessment. Please check your connection.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const completedCount = Object.values(siteData).filter(
    (s) => s.ai_score !== null || s.manual_score !== null
  ).length;

  const totalMrss = Object.values(siteData).reduce((sum, s) => {
    return sum + (s.manual_score ?? s.ai_score ?? 0);
  }, 0);

  return (
    <AppLayout title="New Assessment" showBack>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Stepper */}
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 3,
            '& .MuiStepLabel-label': { fontSize: '0.75rem' },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Step 0: Select Patient */}
        {activeStep === 0 && (
          <Box>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Select Patient
                </Typography>

                <Autocomplete
                  freeSolo
                  options={patients}
                  getOptionLabel={(option) => typeof option === 'string' ? option : `${option.name} (HN: ${option.hn})`}
                  value={selectedPatient || patientName}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'object' && newValue !== null) {
                      setSelectedPatient(newValue as Patient);
                      setPatientName((newValue as Patient).name);
                      setPatientHn((newValue as Patient).hn);
                    } else {
                      setSelectedPatient(null);
                    }
                  }}
                  onInputChange={(_, newInputValue) => {
                    setPatientName(newInputValue);
                    if (selectedPatient && newInputValue !== selectedPatient.name) {
                      setSelectedPatient(null);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Patient Name"
                      fullWidth
                      placeholder="Search existing or type new name..."
                    />
                  )}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Hospital Number (HN)"
                  value={patientHn}
                  onChange={(e) => {
                    setPatientHn(e.target.value);
                    if (selectedPatient && e.target.value !== selectedPatient.hn) {
                       setSelectedPatient(null);
                    }
                  }}
                  placeholder="e.g. HN12345"
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="Assessor Name"
                  value={assessorName}
                  onChange={(e) => setAssessorName(e.target.value)}
                  placeholder="Your name"
                />

                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  endIcon={<NextIcon />}
                  onClick={() => setActiveStep(1)}
                  disabled={!patientName || !patientHn}
                  sx={{ mt: 3, py: 1.5 }}
                >
                  Start Assessment
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Step 1: Photograph Sites */}
        {activeStep === 1 && (
          <Box>
            {/* Progress Bar */}
            <Card sx={{ mb: 2, bgcolor: 'primary.main', color: 'white' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Progress: {completedCount} / 17 sites
                  </Typography>
                  <Chip
                    label={`mRSS: ${totalMrss}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}
                  />
                </Box>
                <Box
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${(completedCount / 17) * 100}%`,
                      bgcolor: 'white',
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Selected Site Camera */}
            {selectedSite && (
              <Slide direction="up" in={!!selectedSite} mountOnEnter unmountOnExit>
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {selectedSite.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedSite.labelTh}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedSite(null);
                          setShowResults(false);
                        }}
                      >
                        Close
                      </Button>
                    </Box>

                    <CameraCapture
                      onCapture={handleCapture}
                      onAnalyze={handleAnalyze}
                      loading={analyzing}
                      capturedImage={siteData[selectedSite.name]?.image_url}
                      siteName={selectedSite.label}
                    />

                    {/* Show results after analysis */}
                    {showResults && siteData[selectedSite.name]?.ai_score !== null && (
                      <Box sx={{ mt: 2 }}>
                        <ScoreCard
                          siteLabel={selectedSite.label}
                          siteLabelTh={selectedSite.labelTh}
                          imageUrl={siteData[selectedSite.name].image_url}
                          aiScore={siteData[selectedSite.name].ai_score}
                          manualScore={siteData[selectedSite.name].manual_score}
                          confidence={siteData[selectedSite.name].confidence}
                          onEditScore={handleOverrideScore}
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Slide>
            )}

            {/* Body Site Selector */}
            <BodySiteSelector
              siteScores={siteData}
              onSelectSite={(site) => {
                setSelectedSite(site);
                setShowResults(siteData[site.name]?.ai_score !== null);
              }}
              selectedSite={selectedSite?.name}
            />

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => setActiveStep(0)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                endIcon={<NextIcon />}
                onClick={() => setActiveStep(2)}
                disabled={completedCount === 0}
                sx={{ flex: 1 }}
              >
                Review ({completedCount} sites)
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Review & Save */}
        {activeStep === 2 && (
          <Box>
            <AssessmentSummary
              siteResults={Object.values(siteData)}
              totalMrss={totalMrss}
            />

            {/* Site Details */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 3, mb: 1.5 }}>
              Site Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {BODY_SITES.map((site) => {
                const data = siteData[site.name];
                return (
                  <ScoreCard
                    key={site.name}
                    siteLabel={site.label}
                    siteLabelTh={site.labelTh}
                    imageUrl={data?.image_url}
                    aiScore={data?.ai_score}
                    manualScore={data?.manual_score}
                    confidence={data?.confidence}
                    onEditScore={(score) => {
                      setSiteData((prev) => ({
                        ...prev,
                        [site.name]: { ...prev[site.name], manual_score: score },
                      }));
                    }}
                    compact
                  />
                );
              })}
            </Box>

            {/* Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Additional clinical notes..."
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<BackIcon />}
                onClick={() => setActiveStep(1)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveAssessment}
                disabled={saving}
                sx={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #0D7377 0%, #323EDD 100%)',
                  py: 1.5,
                }}
              >
                {saving ? 'Saving...' : 'Save Assessment'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </AppLayout>
  );
}

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={
      <AppLayout title="New Assessment" showBack>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    }>
      <NewAssessmentContent />
    </Suspense>
  );
}
