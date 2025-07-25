import { projectId, publicAnonKey } from './supabase/info'
import { supabase } from './supabase/client'
import type { DiagnosisResult } from './questionnaire'

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-c19a985f`

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
}

export interface DiagnosisHistoryEntry {
  user_id: string
  answers: string[]
  result: DiagnosisResult
  created_at: string
}

// ユーザー登録
export async function signUp(email: string, password: string, name: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'サインアップに失敗しました')
    }
    
    return data
  } catch (error) {
    console.error('Signup error:', error)
    throw error
  }
}

// ログイン
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

// ログアウト
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

// 現在のセッション取得
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data
  } catch (error) {
    console.error('Get session error:', error)
    throw error
  }
}

// 診断結果保存
export async function saveDiagnosis(
  answers: string[], 
  result: DiagnosisResult, 
  accessToken: string
) {
  try {
    const response = await fetch(`${API_BASE_URL}/save-diagnosis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ answers, result })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '診断結果の保存に失敗しました')
    }
    
    return data
  } catch (error) {
    console.error('Save diagnosis error:', error)
    throw error
  }
}

// 診断履歴取得
export async function getDiagnosisHistory(accessToken: string): Promise<DiagnosisHistoryEntry[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/diagnosis-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '診断履歴の取得に失敗しました')
    }
    
    return data.history || []
  } catch (error) {
    console.error('Get diagnosis history error:', error)
    throw error
  }
}

// 診断結果削除
export async function deleteDiagnosis(diagnosisId: string, accessToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/diagnosis/${diagnosisId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || '診断結果の削除に失敗しました')
    }
    
    return data
  } catch (error) {
    console.error('Delete diagnosis error:', error)
    throw error
  }
}