'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
} from '@mui/icons-material';
import { SCORE_CONFIG } from '@/lib/huggingface';

interface ScoreCardProps {
  siteLabel: string;
  siteLabelTh?: string;
  imageUrl?: string | null;
  aiScore: number | null;
  manualScore?: number | null;
  confidence?: number | null;
  onEditScore?: (score: number) => void;
  compact?: boolean;
}

export default function ScoreCard({
  siteLabel,
  siteLabelTh,
  imageUrl,
  aiScore,
  manualScore,
  confidence,
  onEditScore,
  compact = false,
}: ScoreCardProps) {
  const [showOverride, setShowOverride] = React.useState(false);
  const displayScore = manualScore !== null && manualScore !== undefined ? manualScore : aiScore;
  const scoreConfig = displayScore !== null && displayScore !== undefined
    ? SCORE_CONFIG[displayScore as keyof typeof SCORE_CONFIG]
    : null;

  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: scoreConfig ? scoreConfig.bgColor : 'grey.50',
          border: '1px solid',
          borderColor: scoreConfig ? scoreConfig.color + '30' : 'grey.200',
        }}
      >
        {imageUrl && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src={imageUrl}
              alt={siteLabel}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {siteLabel}
          </Typography>
          {siteLabelTh && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {siteLabelTh}
            </Typography>
          )}
        </Box>
        {scoreConfig && (
          <Chip
            label={`${displayScore} - ${scoreConfig.label}`}
            size="small"
            sx={{
              bgcolor: scoreConfig.color,
              color: 'white',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          />
        )}
        {displayScore === null && (
          <Chip
            label="Pending"
            size="small"
            variant="outlined"
            sx={{ color: 'text.secondary' }}
          />
        )}
      </Box>
    );
  }

  return (
    <Card
      sx={{
        overflow: 'visible',
        border: '1px solid',
        borderColor: scoreConfig ? scoreConfig.color + '30' : 'grey.200',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Image Thumbnail */}
          {imageUrl && (
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={imageUrl}
                alt={siteLabel}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          )}

          {/* Score Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {siteLabel}
                </Typography>
                {siteLabelTh && (
                  <Typography variant="caption" color="text.secondary">
                    {siteLabelTh}
                  </Typography>
                )}
              </Box>
              {onEditScore && scoreConfig && (
                <IconButton size="small" onClick={() => setShowOverride(!showOverride)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {scoreConfig && (
              <Box sx={{ mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: scoreConfig.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      boxShadow: `0 2px 8px ${scoreConfig.color}50`,
                    }}
                  >
                    {displayScore}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} color={scoreConfig.color}>
                      {scoreConfig.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {scoreConfig.description}
                    </Typography>
                  </Box>
                </Box>

                {confidence !== null && confidence !== undefined && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        AI Confidence
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {(confidence * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={confidence * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: confidence > 0.8 ? 'success.main' : confidence > 0.5 ? 'warning.main' : 'error.main',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                )}

                {manualScore !== null && manualScore !== undefined && manualScore !== aiScore && (
                  <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                    ⚠️ Clinician override (AI predicted: {aiScore})
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Override Score */}
        <Collapse in={showOverride}>
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: '1px solid',
              borderColor: 'grey.100',
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
            }}
          >
            {[0, 1, 2, 3].map((score) => {
              const config = SCORE_CONFIG[score as keyof typeof SCORE_CONFIG];
              return (
                <Chip
                  key={score}
                  label={`${score} - ${config.label}`}
                  onClick={() => {
                    onEditScore?.(score);
                    setShowOverride(false);
                  }}
                  sx={{
                    bgcolor: displayScore === score ? config.color : config.bgColor,
                    color: displayScore === score ? 'white' : config.color,
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: config.color,
                      color: 'white',
                    },
                    transition: 'all 0.2s ease',
                  }}
                />
              );
            })}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
