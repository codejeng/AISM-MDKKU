'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  Avatar,
} from '@mui/material';
import {
  AddAPhoto as AssessIcon,
  People as PeopleIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  TrendingUp as TrendingIcon,
  PhotoCamera as CameraIcon,
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';

const QUICK_ACTIONS = [
  {
    title: 'New Assessment',
    titleTh: 'เริ่มประเมินใหม่',
    description: 'Photograph & grade skin',
    icon: <AssessIcon sx={{ fontSize: 32 }} />,
    path: '/assessment/new',
    gradient: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 100%)',
  },
  {
    title: 'Patients',
    titleTh: 'ผู้ป่วย',
    description: 'Manage patient records',
    icon: <PeopleIcon sx={{ fontSize: 32 }} />,
    path: '/patients',
    gradient: 'linear-gradient(135deg, #323EDD 0%, #6B74FF 100%)',
  },
  {
    title: 'History',
    titleTh: 'ประวัติ',
    description: 'View past assessments',
    icon: <HistoryIcon sx={{ fontSize: 32 }} />,
    path: '/history',
    gradient: 'linear-gradient(135deg, #E91E63 0%, #FF5252 100%)',
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        {/* Hero Section */}
        <Card
          sx={{
            mb: 3,
            background: 'linear-gradient(135deg, #0D7377 0%, #323EDD 100%)',
            color: 'white',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <HospitalIcon sx={{ fontSize: 20 }} />
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>
                MDKKU Medical AI
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
              SSc Skin Assessment
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.6 }}>
              AI-powered modified Rodnan Skin Score (mRSS) assessment.
              Photograph skin at 17 body sites for automated grading.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Chip
                icon={<CameraIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                label="Mobile Camera"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
              <Chip
                icon={<TrendingIcon sx={{ color: 'white !important', fontSize: 16 }} />}
                label="AI Grading 0-3"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, px: 0.5 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {QUICK_ACTIONS.map((action) => (
            <Grid size={{ xs: 12 }} key={action.path}>
              <Card
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardActionArea onClick={() => router.push(action.path)}>
                  <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 56,
                          height: 56,
                          background: action.gradient,
                          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                          {action.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {action.titleTh}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                          {action.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* mRSS Info */}
        <Card sx={{ mt: 3, bgcolor: 'info.light', border: 'none' }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} color="info.main" sx={{ mb: 0.5 }}>
              💡 About mRSS
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              The modified Rodnan Skin Score assesses skin thickness at 17 body sites.
              Each site is graded 0-3 (normal to severe), with a total score of 0-51.
              This AI tool assists clinicians with objective, reproducible scoring.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
}
