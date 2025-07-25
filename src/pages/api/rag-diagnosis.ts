import type { NextApiRequest, NextApiResponse } from 'next';
import { herbalRAG } from '../../supabase/functions/server/rag_system';

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

    // Initialize RAG system if not already done
    await herbalRAG.initialize();

    // Perform diagnosis
    const result = await herbalRAG.performDiagnosis(userResponses);

    return res.status(200).json({
      success: true,
      diagnosis: result.diagnosis,
      context: result.context,
      metadata: result.metadata
    });

  } catch (error) {
    console.error('RAG diagnosis error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}