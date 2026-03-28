export interface PredictionResult {
  score: number;          // 0-3 mRSS grade
  confidence: number;     // 0.0 - 1.0
  probabilities: number[]; // [p0, p1, p2, p3]
  mock?: boolean;         // true when using simulated prediction
}

export async function predictSkinScore(imageBase64: string): Promise<PredictionResult> {
  const response = await fetch('/api/predict', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Prediction failed');
  }

  return response.json();
}

// Convert a File to base64 string
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

// Score labels and colors
export const SCORE_CONFIG = {
  0: { label: 'Normal', color: '#4CAF50', bgColor: '#E8F5E9', description: 'Normal skin thickness' },
  1: { label: 'Mild', color: '#FF9800', bgColor: '#FFF3E0', description: 'Mild skin thickening' },
  2: { label: 'Moderate', color: '#F44336', bgColor: '#FFEBEE', description: 'Moderate skin thickening' },
  3: { label: 'Severe', color: '#9C27B0', bgColor: '#F3E5F5', description: 'Severe skin thickening' },
} as const;
