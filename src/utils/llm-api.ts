import { projectId, publicAnonKey } from './supabase/info'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c19a985f`

export interface LLMDiagnosisResult {
  category: string;
  statusSummary: string;
  recommendedHerbs: string[];
  benefits: string[];
  advice: string;
  instructions: string;
}

export interface LLMDiagnosisResponse {
  success: boolean;
  diagnosis: LLMDiagnosisResult;
  note?: string;
}

// Advanced RAG + LLM診断
export async function diagnoseWithLLM(
  symptoms: string[], 
  userAnswers: Record<string, boolean>,
  userId?: string
): Promise<LLMDiagnosisResponse> {
  try {
    console.log('Calling advanced RAG + LLM diagnosis endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/diagnose-advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ symptoms, userAnswers, userId })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'RAG診断に失敗しました')
    }
    
    console.log('RAG diagnosis completed:', {
      ragUsed: data.metadata?.ragUsed,
      processingTime: data.metadata?.processingTime,
      sources: data.metadata?.sources
    });
    
    return data
  } catch (error) {
    console.error('RAG diagnosis error:', error)
    throw error
  }
}

// Advanced LLMチャット応答生成
export async function getChatResponse(
  message: string,
  context?: any,
  conversationHistory?: any[]
): Promise<string> {
  try {
    console.log('Calling advanced chat endpoint...');
    
    const response = await fetch(`${API_BASE_URL}/chat-advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ message, context, conversationHistory })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'チャット応答の生成に失敗しました')
    }
    
    console.log('Chat response generated:', {
      processingTime: data.metadata?.processingTime,
      llmTokens: data.metadata?.llmTokens
    });
    
    return data.response || '申し訳ございませんが、応答を生成できませんでした。'
  } catch (error) {
    console.error('Advanced chat response error:', error)
    return '申し訳ございませんが、現在システムが利用できません。'
  }
}

// 診断履歴取得
export async function getDiagnosisHistory(userId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/diagnosis-history/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '履歴の取得に失敗しました')
    }
    
    return data.history || []
  } catch (error) {
    console.error('History retrieval error:', error)
    return []
  }
}

// システム状態確認
export async function checkSystemHealth(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    })
    
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Health check error:', error)
    return { status: 'error', services: {} }
  }
}