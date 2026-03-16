'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  AddAPhoto as AddAPhotoIcon,
  History as HistoryIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { label: 'Patients', icon: <PeopleIcon />, path: '/patients' },
  { label: 'Assess', icon: <AddAPhotoIcon />, path: '/assessment/new' },
  { label: 'History', icon: <HistoryIcon />, path: '/history' },
];

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export default function AppLayout({ children, title, showBack }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentNavIndex = NAV_ITEMS.findIndex((item) => {
    if (item.path === '/') return pathname === '/';
    return pathname.startsWith(item.path);
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: 'white',
          color: 'text.primary',
        }}
      >
        <Toolbar>
          {showBack && (
            <IconButton edge="start" onClick={() => router.back()} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                background: 'linear-gradient(135deg, #0D7377 0%, #323EDD 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
              }}
            >
              {title || 'AISM-MDKKU'}
            </Typography>
            {!title && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                SSc Skin Assessment System
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'auto',
          pb: '80px', // space for bottom nav
          px: 2,
          py: 2,
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: 'white',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
        }}
      >
        <BottomNavigation
          value={currentNavIndex >= 0 ? currentNavIndex : 0}
          onChange={(_, newValue) => {
            router.push(NAV_ITEMS[newValue].path);
          }}
          showLabels
          sx={{
            '& .Mui-selected': {
              color: 'primary.main',
            },
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              py: 1,
            },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{
                '&.Mui-selected': {
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.15)',
                    transition: 'transform 0.2s ease',
                  },
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Box>
    </Box>
  );
}
