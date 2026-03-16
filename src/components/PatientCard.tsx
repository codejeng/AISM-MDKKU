'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActionArea,
  Box,
  Typography,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';

interface PatientCardProps {
  name: string;
  hn: string;
  age: number;
  gender: string;
  diagnosisDate?: string | null;
  lastAssessment?: string | null;
  onClick?: () => void;
}

export default function PatientCard({
  name,
  hn,
  age,
  gender,
  diagnosisDate,
  lastAssessment,
  onClick,
}: PatientCardProps) {
  return (
    <Card
      sx={{
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      <CardActionArea onClick={onClick}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: gender === 'F' ? '#E91E63' + '20' : '#2196F3' + '20',
                color: gender === 'F' ? '#E91E63' : '#2196F3',
              }}
            >
              <PersonIcon />
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary" noWrap>
                {name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label={`HN: ${hn}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {age} yrs • {gender === 'F' ? 'Female' : 'Male'}
                </Typography>
              </Box>

              {(diagnosisDate || lastAssessment) && (
                <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
                  {diagnosisDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                      <CalendarIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Dx: {new Date(diagnosisDate).toLocaleDateString('th-TH')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
