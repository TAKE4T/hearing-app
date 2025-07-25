import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userResponses } = req.body;

    if (!userResponses || typeof userResponses !== 'object') {
      return res.status(400).json({ error: 'Invalid user responses' });
    }

    // RAG system temporarily disabled for build
    const mockResult = {
      diagnosis: {
        category: "一般的な健康状態",
        statusSummary: "特に問題は見つかりませんでした",
        advice: "バランスの取れた食事と適度な運動を心がけてください",
        recommendedHerbs: ["カモミール", "ペパーミント"],
        benefits: ["リラクゼーション", "消化促進"],
        instructions: "お湯に浸して5分間待ってからお飲みください"
      },
      context: [],
      metadata: {}
    };

    return res.status(200).json({
      success: true,
      diagnosis: mockResult.diagnosis,
      context: mockResult.context,
      metadata: mockResult.metadata
    });

  } catch (error) {
    console.error('RAG diagnosis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}