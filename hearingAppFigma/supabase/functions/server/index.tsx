import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

// Import RAG and LLM modules (Python-style imports)
import { herbalRAG } from "./rag_system.tsx";
import { createHerbalChains } from "./llm_chain.tsx";

const app = new Hono();

// Enable logger and CORS
app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize RAG system on server startup
let ragInitialized = false;
let chains: any = {};

async function initializeRAGSystem() {
  if (ragInitialized) return;
  
  try {
    console.log('Initializing RAG system...');
    await herbalRAG.initialize();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiApiKey) {
      chains = createHerbalChains(openaiApiKey);
      console.log('RAG and LLM chains initialized successfully');
    } else {
      console.warn('OpenAI API key not found, using fallback mode');
    }
    
    ragInitialized = true;
  } catch (error) {
    console.error('Failed to initialize RAG system:', error);
    ragInitialized = false;
  }
}

// Health check endpoint
app.get("/make-server-c19a985f/health", async (c) => {
  const ragStatus = ragInitialized ? 'active' : 'initializing';
  const llmStatus = chains.llm ? 'active' : 'unavailable';
  
  return c.json({ 
    status: "ok", 
    services: {
      rag: ragStatus,
      llm: llmStatus,
      database: 'active'
    },
    timestamp: new Date().toISOString()
  });
});

// Main diagnosis endpoint using RAG + LLM chain
app.post('/make-server-c19a985f/diagnose-advanced', async (c) => {
  // Initialize RAG if not already done
  if (!ragInitialized) {
    await initializeRAGSystem();
  }

  try {
    const requestData = await c.req.json();
    const { symptoms, userAnswers, userId } = requestData;
    
    console.log(`Processing diagnosis request for ${symptoms?.length || 0} symptoms`);
    
    // Validate input
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return c.json({ 
        success: false, 
        error: 'Invalid symptoms data provided' 
      }, 400);
    }

    // Use RAG + LLM chain for diagnosis
    if (chains.diagnosisChain && ragInitialized) {
      console.log('Using advanced RAG + LLM diagnosis...');
      
      const diagnosisChain = chains.diagnosisChain(herbalRAG);
      const chainResult = await diagnosisChain.invoke({
        symptoms,
        userAnswers: userAnswers || {}
      });

      // Store diagnosis result if userId provided
      if (userId) {
        try {
          const diagnosisRecord = {
            userId,
            symptoms,
            userAnswers,
            result: chainResult.result,
            metadata: {
              ...chainResult.metadata,
              timestamp: new Date().toISOString(),
              version: 'rag_llm_v1'
            }
          };
          
          await kv.set(`diagnosis_${userId}_${Date.now()}`, diagnosisRecord);
          console.log(`Stored diagnosis for user: ${userId}`);
        } catch (storageError) {
          console.warn('Failed to store diagnosis:', storageError);
        }
      }

      return c.json({
        success: true,
        diagnosis: chainResult.result,
        metadata: {
          processingTime: chainResult.metadata.processingTime,
          ragUsed: chainResult.metadata.ragUsed,
          sources: chainResult.metadata.sources?.length || 0,
          llmTokens: chainResult.metadata.llmResponse?.usage?.totalTokens
        }
      });
      
    } else {
      // Fallback to simple rule-based diagnosis
      console.log('Using fallback diagnosis method...');
      
      const fallbackResult = generateSimpleDiagnosis(symptoms, userAnswers);
      
      return c.json({
        success: true,
        diagnosis: fallbackResult,
        metadata: {
          processingTime: 100,
          ragUsed: false,
          fallbackMode: true
        }
      });
    }
    
  } catch (error) {
    console.error('Advanced diagnosis error:', error);
    
    return c.json({
      success: false,
      error: 'Diagnosis processing failed',
      details: error.message
    }, 500);
  }
});

// Chat response endpoint using LLM chain
app.post('/make-server-c19a985f/chat-advanced', async (c) => {
  if (!ragInitialized) {
    await initializeRAGSystem();
  }

  try {
    const { message, context, conversationHistory } = await c.req.json();
    
    if (!message || typeof message !== 'string') {
      return c.json({ 
        success: false, 
        error: 'Invalid message provided' 
      }, 400);
    }

    if (chains.chatChain) {
      console.log('Processing chat with LLM chain...');
      
      const chatResult = await chains.chatChain.invoke({
        message,
        context,
        conversationHistory
      });

      return c.json({
        success: true,
        response: chatResult.result,
        metadata: {
          processingTime: chatResult.metadata.processingTime,
          llmTokens: chatResult.metadata.llmResponse?.usage?.totalTokens
        }
      });
      
    } else {
      // Simple fallback responses
      const fallbackResponses = [
        "申し訳ございませんが、現在システムがメンテナンス中です。",
        "ご質問ありがとうございます。専門スタッフによる回答準備中です。",
        "システムの調整中のため、しばらくしてからもう一度お試しください。"
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      return c.json({
        success: true,
        response: randomResponse,
        metadata: {
          processingTime: 50,
          fallbackMode: true
        }
      });
    }
    
  } catch (error) {
    console.error('Chat processing error:', error);
    
    return c.json({
      success: false,
      error: 'Chat processing failed',
      details: error.message
    }, 500);
  }
});

// Get user diagnosis history
app.get('/make-server-c19a985f/diagnosis-history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ success: false, error: 'User ID required' }, 400);
    }

    // Get all diagnosis records for user
    const historyKeys = await kv.getByPrefix(`diagnosis_${userId}_`);
    const history = historyKeys
      .sort((a, b) => new Date(b.metadata?.timestamp || 0).getTime() - new Date(a.metadata?.timestamp || 0).getTime())
      .slice(0, 10); // Limit to last 10 diagnoses

    return c.json({
      success: true,
      history: history.map(record => ({
        id: record.key,
        timestamp: record.metadata?.timestamp,
        category: record.result?.category,
        symptoms: record.symptoms,
        processingTime: record.metadata?.processingTime,
        ragUsed: record.metadata?.ragUsed
      }))
    });
    
  } catch (error) {
    console.error('History retrieval error:', error);
    return c.json({
      success: false,
      error: 'Failed to retrieve history'
    }, 500);
  }
});

// Fallback diagnosis function
function generateSimpleDiagnosis(symptoms: string[], userAnswers: Record<string, boolean> = {}) {
  const symptomText = symptoms.join(' ').toLowerCase();
  
  // Simple keyword matching
  if (symptomText.includes('ストレス') || symptomText.includes('不安') || symptomText.includes('睡眠')) {
    return {
      category: "ストレス・メンタルケア",
      statusSummary: "心身の緊張とストレスが見られます。リラクゼーションが推奨されます。",
      recommendedHerbs: ["カモミール", "ラベンダー", "パッションフラワー", "レモンバーム"],
      benefits: ["リラックス効果", "睡眠の質向上", "ストレス軽減", "神経の鎮静"],
      advice: "規則正しい睡眠リズムを心がけ、就寝前のリラックス時間を作りましょう。",
      instructions: "就寝1時間前に15-20分間蒸してください。深呼吸とともに香りを楽しみましょう。",
      duration: "2-3週間の継続使用",
      frequency: "毎日",
      precautions: "妊娠中・授乳中は使用前に医師にご相談ください。"
    };
  }
  
  if (symptomText.includes('生理') || symptomText.includes('ホルモン') || symptomText.includes('女性')) {
    return {
      category: "ホルモンバランス・女性の健康",
      statusSummary: "ホルモンバランスの調整が必要な状態です。自然なサポートが有効です。",
      recommendedHerbs: ["ローズ", "クラリセージ", "ゼラニウム", "チェストベリー"],
      benefits: ["ホルモンバランス調整", "生理痛緩和", "美肌効果", "情緒安定"],
      advice: "バランスの良い食事と適度な運動、十分な睡眠を心がけましょう。",
      instructions: "月経前1週間から毎日20分間使用してください。温かい環境でリラックスして。",
      duration: "1-2ヶ月の継続",
      frequency: "毎日",
      precautions: "妊娠中・授乳中は使用を避けてください。"
    };
  }
  
  if (symptomText.includes('冷え') || symptomText.includes('疲労') || symptomText.includes('血行')) {
    return {
      category: "冷え・血行改善",
      statusSummary: "体の冷えと血行不良が見られます。温活による改善が期待できます。",
      recommendedHerbs: ["ジンジャー", "シナモン", "クローブ", "ローズマリー"],
      benefits: ["血行促進", "代謝向上", "冷え改善", "エネルギー増進"],
      advice: "体を温める食事を摂り、入浴時間を長めに取りましょう。適度な運動も効果的です。",
      instructions: "入浴前に20-30分間蒸気浴をしてください。足浴との併用もおすすめです。",
      duration: "継続使用で2-3週間後に効果実感",
      frequency: "週3-4回",
      precautions: "高血圧の方は使用前に医師にご相談ください。"
    };
  }
  
  // Default case
  return {
    category: "全体的な健康維持",
    statusSummary: "総合的な健康維持とリフレッシュが推奨されます。",
    recommendedHerbs: ["カモミール", "ラベンダー", "ローズマリー", "ネトル"],
    benefits: ["リフレッシュ効果", "抗酸化作用", "免疫サポート", "リラックス"],
    advice: "バランスの良い生活習慣を継続し、定期的なセルフケアを取り入れましょう。",
    instructions: "週2-3回、リラックスしたい時に15-20分間蒸してください。",
    duration: "継続使用推奨",
    frequency: "週2-3回",
    precautions: "体調に合わせて使用頻度を調整してください。"
  };
}

// Root endpoint
app.get('/make-server-c19a985f/', (c) => {
  return c.text('Advanced Herbal Health AI API with RAG + LangChain is running! 🌿');
});

// Initialize RAG system on startup
console.log('Starting RAG system initialization...');
initializeRAGSystem().then(() => {
  console.log('Server ready with RAG capabilities');
}).catch(error => {
  console.error('RAG initialization failed, running in fallback mode:', error);
});

Deno.serve(app.fetch);