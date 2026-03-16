'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { SCORE_CONFIG } from '@/lib/huggingface';

interface SiteResult {
  site_name: string;
  site_label: string;
  ai_score: number | null;
  manual_score: number | null;
  image_url: string | null;
  confidence: number | null;
}

interface AssessmentSummaryProps {
  siteResults: SiteResult[];
  totalMrss: number;
  maxMrss?: number;
}

export default function AssessmentSummary({
  siteResults,
  totalMrss,
  maxMrss = 51,
}: AssessmentSummaryProps) {
  const completedSites = siteResults.filter(
    (s) => s.ai_score !== null || s.manual_score !== null
  );

  const getSeverityLevel = (total: number) => {
    if (total === 0) return { label: 'Normal', color: '#4CAF50' };
    if (total <= 10) return { label: 'Mild', color: '#FF9800' };
    if (total <= 25) return { label: 'Moderate', color: '#F44336' };
    return { label: 'Severe', color: '#9C27B0' };
  };

  const severity = getSeverityLevel(totalMrss);

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, #0D7377 0%, #323EDD 100%)',
        color: 'white',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Total Score */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
            Total mRSS Score
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 0.5,
              mt: 0.5,
            }}
          >
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                textShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              {totalMrss}
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.7 }}>
              / {maxMrss}
            </Typography>
          </Box>
          <Chip
            label={severity.label}
            sx={{
              mt: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', my: 2 }} />

        {/* Site Breakdown */}
        <Typography variant="caption" sx={{ opacity: 0.8, mb: 1, display: 'block' }}>
          Assessed Sites: {completedSites.length} / {siteResults.length}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {siteResults.map((site) => {
            const score = site.manual_score ?? site.ai_score;
            const config = score !== null
              ? SCORE_CONFIG[score as keyof typeof SCORE_CONFIG]
              : null;

            return (
              <Box
                key={site.site_name}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: config ? config.color : 'rgba(255,255,255,0.15)',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                  title: site.site_label,
                }}
              >
                {score !== null ? score : '—'}
              </Box>
            );
          })}
        </Box>

        {/* Score Distribution */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
          {[0, 1, 2, 3].map((score) => {
            const config = SCORE_CONFIG[score as keyof typeof SCORE_CONFIG];
            const count = completedSites.filter((s) => (s.manual_score ?? s.ai_score) === score).length;
            return (
              <Box key={score} sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: config.color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    mx: 'auto',
                    mb: 0.5,
                    boxShadow: `0 2px 8px ${config.color}40`,
                  }}
                >
                  {count}
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.6rem' }}>
                  {config.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
