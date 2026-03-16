import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
    const MODEL_ID = process.env.HUGGINGFACE_MODEL_ID;

    if (!HF_TOKEN || !MODEL_ID) {
      // Return mock data when credentials are not configured
      console.warn('Hugging Face credentials not configured, returning mock prediction');
      const mockScore = Math.floor(Math.random() * 4); // 0-3
      const mockProbabilities = [0, 0, 0, 0];
      mockProbabilities[mockScore] = 0.75 + Math.random() * 0.2;
      const remaining = 1 - mockProbabilities[mockScore];
      for (let i = 0; i < 4; i++) {
        if (i !== mockScore) {
          mockProbabilities[i] = remaining / 3;
        }
      }
      return NextResponse.json({
        score: mockScore,
        confidence: mockProbabilities[mockScore],
        probabilities: mockProbabilities,
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
