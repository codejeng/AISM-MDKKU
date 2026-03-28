import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    const MODEL_ID = process.env.HUGGINGFACE_MODEL_ID;

    const isConfigured = HF_TOKEN && MODEL_ID
      && !HF_TOKEN.startsWith('your-') && !MODEL_ID.startsWith('your-');

    if (!isConfigured) {
      // Return realistic mock data when credentials are not configured
      console.warn('Hugging Face credentials not configured, returning mock prediction');

      // Simulate AI inference delay (1.5–3 seconds)
      const delay = 1500 + Math.random() * 1500;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Weighted random: most skin sites tend to be normal (0) or mild (1)
      const weights = [0.45, 0.30, 0.15, 0.10]; // probabilities for scores 0, 1, 2, 3
      const rand = Math.random();
      let cumulative = 0;
      let mockScore = 0;
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) {
          mockScore = i;
          break;
        }
      }

      // Generate realistic probability distribution
      const mockConfidence = 0.65 + Math.random() * 0.30; // 0.65–0.95
      const mockProbabilities = [0, 0, 0, 0];
      mockProbabilities[mockScore] = mockConfidence;
      const remaining = 1 - mockConfidence;
      // Distribute remaining probability with some randomness
      const otherIndices = [0, 1, 2, 3].filter((i) => i !== mockScore);
      const rawShares = otherIndices.map(() => Math.random());
      const shareSum = rawShares.reduce((a, b) => a + b, 0);
      otherIndices.forEach((idx, i) => {
        mockProbabilities[idx] = (rawShares[i] / shareSum) * remaining;
      });

      return NextResponse.json({
        score: mockScore,
        confidence: mockConfidence,
        probabilities: mockProbabilities,
        mock: true,
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Call Hugging Face Inference API
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/octet-stream',
        },
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      return NextResponse.json(
        { error: 'AI prediction failed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();

    // Parse Hugging Face image classification response
    // Expected format: [{ label: "0", score: 0.95 }, { label: "1", score: 0.03 }, ...]
    let probabilities = [0, 0, 0, 0];
    let predictedScore = 0;
    let maxConfidence = 0;

    if (Array.isArray(result)) {
      for (const pred of result) {
        const label = parseInt(pred.label);
        if (label >= 0 && label <= 3) {
          probabilities[label] = pred.score;
          if (pred.score > maxConfidence) {
            maxConfidence = pred.score;
            predictedScore = label;
          }
        }
      }
    }

    return NextResponse.json({
      score: predictedScore,
      confidence: maxConfidence,
      probabilities,
    });
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
