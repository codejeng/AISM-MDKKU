import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeRegistry from '@/theme/ThemeRegistry';

export const metadata: Metadata = {
  title: 'AISM-MDKKU | SSc Skin Assessment',
  description: 'AI-powered Systemic Sclerosis skin assessment using modified Rodnan Skin Score (mRSS). Photograph skin at 17 body sites and get AI-assisted grading.',
  keywords: 'SSc, systemic sclerosis, mRSS, skin assessment, AI, medical',
  authors: [{ name: 'MDKKU' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0D7377',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
