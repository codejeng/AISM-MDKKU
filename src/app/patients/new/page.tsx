'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';

export default function NewPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    hn: '',
    age: '',
    gender: '',
    diagnosis_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.hn) {
      setError('Name and HN are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          age: form.age ? parseInt(form.age) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create patient');
      }

      router.push('/patients');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create patient';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Add Patient" showBack>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PersonAddIcon color="primary" />
              <Typography variant="h6">New Patient</Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Patient Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  placeholder="Enter patient name"
                />

                <TextField
                  label="Hospital Number (HN) *"
                  value={form.hn}
                  onChange={(e) => setForm({ ...form, hn: e.target.value })}
                  fullWidth
                  placeholder="e.g. HN001234"
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Age"
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Gender"
                    select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    sx={{ flex: 1 }}
                  >
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                  </TextField>
                </Box>

                <TextField
                  label="Diagnosis Date"
                  type="date"
                  value={form.diagnosis_date}
                  onChange={(e) => setForm({ ...form, diagnosis_date: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{
                    mt: 1,
                    background: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 100%)',
                    py: 1.5,
                  }}
                >
                  {loading ? 'Saving...' : 'Save Patient'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
}
