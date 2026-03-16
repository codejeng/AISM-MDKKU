'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Replay as RetakeIcon,
  CheckCircle as ConfirmIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';

interface CameraCaptureProps {
  onCapture: (file: File, previewUrl: string) => void;
  onAnalyze: () => void;
  disabled?: boolean;
  loading?: boolean;
  capturedImage?: string | null;
  siteName?: string;
}

export default function CameraCapture({
  onCapture,
  onAnalyze,
  disabled,
  loading,
  capturedImage,
  siteName,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(capturedImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onCapture(file, url);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '2px dashed',
        borderColor: preview ? 'primary.main' : 'grey.300',
        bgcolor: preview ? 'primary.main' + '08' : 'grey.50',
        transition: 'all 0.3s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id={`camera-input-${siteName}`}
      />

      {!preview ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(13, 115, 119, 0.4)' },
                '70%': { boxShadow: '0 0 0 15px rgba(13, 115, 119, 0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(13, 115, 119, 0)' },
              },
            }}
          >
            <CameraIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Tap to photograph
          </Typography>
          {siteName && (
            <Typography variant="body2" color="primary" fontWeight={600}>
              {siteName}
            </Typography>
          )}
          <Button
            variant="contained"
            startIcon={<CameraIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            size="large"
            sx={{ mt: 1 }}
          >
            Take Photo
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
                // Restore capture for next time
                setTimeout(() => {
                  fileInputRef.current?.setAttribute('capture', 'environment');
                }, 100);
              }
            }}
            disabled={disabled}
            size="small"
            sx={{ color: 'text.secondary', borderColor: 'grey.300' }}
          >
            Upload from Gallery
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 300,
              aspectRatio: '4/3',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}
          >
            <img
              src={preview}
              alt="Captured skin"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <IconButton
              onClick={handleRetake}
              sx={{
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' },
              }}
            >
              <RetakeIcon />
            </IconButton>

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ConfirmIcon />}
              onClick={onAnalyze}
              disabled={loading || disabled}
              sx={{
                px: 4,
                background: 'linear-gradient(135deg, #0D7377 0%, #14A3A8 100%)',
              }}
            >
              {loading ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
