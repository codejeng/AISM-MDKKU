'use client';

import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Badge,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as PendingIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';
import { BODY_SITES, BODY_REGIONS, type BodySite } from '@/lib/bodySites';
import { SCORE_CONFIG } from '@/lib/huggingface';

interface SiteScore {
  site_name: string;
  ai_score: number | null;
  manual_score: number | null;
  image_url: string | null;
}

interface BodySiteSelectorProps {
  siteScores: Record<string, SiteScore>;
  onSelectSite: (site: BodySite) => void;
  selectedSite?: string | null;
}

export default function BodySiteSelector({
  siteScores,
  onSelectSite,
  selectedSite,
}: BodySiteSelectorProps) {
  const getCompletedCount = (regionKey: string) => {
    return BODY_SITES.filter(
      (s) => s.region === regionKey && siteScores[s.name]?.ai_score !== null && siteScores[s.name]?.ai_score !== undefined
    ).length;
  };

  const getTotalCount = (regionKey: string) => {
    return BODY_SITES.filter((s) => s.region === regionKey).length;
  };

  const getScore = (siteName: string): number | null => {
    const data = siteScores[siteName];
    if (!data) return null;
    return data.manual_score ?? data.ai_score ?? null;
  };

  return (
    <Box>
      {/* Progress Summary */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: 1,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        {Object.values(SCORE_CONFIG).map((config, idx) => {
          const count = Object.values(siteScores).filter((s) => {
            const score = s.manual_score ?? s.ai_score;
            return score === idx;
          }).length;
          return (
            <Chip
              key={idx}
              label={`${config.label}: ${count}`}
              size="small"
              sx={{
                bgcolor: config.bgColor,
                color: config.color,
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          );
        })}
      </Box>

      {/* Body Region Accordions */}
      {BODY_REGIONS.map((region) => {
        const completed = getCompletedCount(region.key);
        const total = getTotalCount(region.key);
        const sites = BODY_SITES.filter((s) => s.region === region.key);

        return (
          <Accordion
            key={region.key}
            defaultExpanded={completed < total}
            sx={{
              mb: 1,
              '&:before': { display: 'none' },
              borderRadius: '12px !important',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                bgcolor: completed === total ? 'success.light' : 'white',
                transition: 'background-color 0.3s ease',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                <Typography fontSize="1.5rem">{region.icon}</Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {region.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {region.labelTh}
                  </Typography>
                </Box>
                <Chip
                  label={`${completed}/${total}`}
                  size="small"
                  color={completed === total ? 'success' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {sites.map((site) => {
                  const score = getScore(site.name);
                  const hasImage = siteScores[site.name]?.image_url;
                  const isSelected = selectedSite === site.name;
                  const scoreConfig = score !== null
                    ? SCORE_CONFIG[score as keyof typeof SCORE_CONFIG]
                    : null;

                  return (
                    <Box
                      key={site.name}
                      onClick={() => onSelectSite(site)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: isSelected
                          ? 'primary.main' + '12'
                          : score !== null
                            ? scoreConfig?.bgColor
                            : 'grey.50',
                        border: '1px solid',
                        borderColor: isSelected
                          ? 'primary.main'
                          : score !== null
                            ? scoreConfig?.color + '30'
                            : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: isSelected
                            ? 'primary.main' + '18'
                            : 'grey.100',
                          transform: 'translateX(4px)',
                        },
                        '&:active': {
                          transform: 'scale(0.98)',
                        },
                      }}
                    >
                      {score !== null ? (
                        <Badge
                          badgeContent={score}
                          sx={{
                            '& .MuiBadge-badge': {
                              bgcolor: scoreConfig?.color,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              minWidth: 18,
                              height: 18,
                            },
                          }}
                        >
                          <CheckIcon sx={{ color: scoreConfig?.color, fontSize: 22 }} />
                        </Badge>
                      ) : (
                        <PendingIcon sx={{ color: 'grey.400', fontSize: 22 }} />
                      )}

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {site.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {site.labelTh}
                        </Typography>
                      </Box>

                      {!hasImage && (
                        <CameraIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      )}

                      {hasImage && (
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={siteScores[site.name].image_url!}
                            alt={site.label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
