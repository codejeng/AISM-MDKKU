'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Fab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';
import PatientCard from '@/components/PatientCard';
import { type Patient } from '@/lib/supabase';

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      setError('Unable to load patients. Please check your Supabase configuration.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.hn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Patients" showBack>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search by name or HN..."
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
            <Typography variant="h1" sx={{ fontSize: '3rem', mb: 1 }}>
              🏥
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {search ? 'No patients found' : 'No patients yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {search ? 'Try a different search' : 'Add your first patient to get started'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map((patient) => (
              <PatientCard
                key={patient.id}
                name={patient.name}
                hn={patient.hn}
                age={patient.age}
                gender={patient.gender}
                diagnosisDate={patient.diagnosis_date}
                onClick={() => router.push(`/patients/${patient.id}`)}
              />
            ))}
          </Box>
        )}

        {/* FAB */}
        <Fab
          color="primary"
          onClick={() => router.push('/patients/new')}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            background: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 100%)',
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    </AppLayout>
  );
}
