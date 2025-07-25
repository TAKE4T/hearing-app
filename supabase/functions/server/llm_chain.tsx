// LLM Chain Implementation inspired by LangChain
// Python-style async/await patterns in TypeScript

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Base LLM class (similar to LangChain's LLM interface)
export abstract class BaseLLM {
  protected apiKey: string;
  protected model: string;
  protected temperature: number;
  protected maxTokens: number;

  constructor(config: {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-3.5-turbo';
    this.temperature = config.temperature || 0.7;
    this.maxTokens = config.maxTokens || 1000;
  }

  abstract async invoke(messages: ChatMessage[]): Promise<LLMResponse>;
  abstract async generateResponse(prompt: string, systemMessage?: string): Promise<string>;
}

// OpenAI LLM implementation
export class OpenAILLM extends BaseLLM {
  private baseURL = 'https://api.openai.com/v1/chat/completions';

  async invoke(messages: ChatMessage[]): Promise<LLMResponse> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
        model: data.model,
        finishReason: data.choices[0].finish_reason,
      };
    } catch (error) {
      console.error('OpenAI LLM invoke error:', error);
      throw error;
    }
  }

  async generateResponse(prompt: string, systemMessage?: string): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });
    
    const response = await this.invoke(messages);
    return response.content;
  }
}

// Chain interface (similar to LangChain chains)
export interface ChainInput {
  symptoms: string[];
  userAnswers: Record<string, boolean>;
  context?: string;
  metadata?: any;
}

export interface ChainOutput {
  result: any;
  metadata: {
    sources?: any[];
    llmResponse?: LLMResponse;
    processingTime: number;
    ragUsed: boolean;
  };
}

// Diagnosis Chain (combining RAG + LLM)
export class HerbalDiagnosisChain {
  private llm: BaseLLM;
  private ragChain: any; // Will be injected

  constructor(llm: BaseLLM, ragChain?: any) {
    this.llm = llm;
    this.ragChain = ragChain;
  }

  async invoke(input: ChainInput): Promise<ChainOutput> {
    const startTime = Date.now();
    let ragContext = '';
    let sources: any[] = [];
    let ragUsed = false;

    try {
      // Step 1: RAG Retrieval (if available)
      if (this.ragChain) {
        console.log('Retrieving context from RAG system...');
        const ragResult = await this.ragChain.retrieveContext(input.symptoms, input.userAnswers);
        ragContext = ragResult.context;
        sources = ragResult.sources;
        ragUsed = true;
        console.log(`RAG retrieved ${sources.length} relevant documents`);
      }

      // Step 2: Generate prompt
      const { systemPrompt, userPrompt } = this.ragChain?.generatePrompt(
        ragContext, 
        input.symptoms, 
        input.userAnswers
      ) || {
        systemPrompt: `あなたは健康とハーブの専門家です。ユーザーの症状に基づいて最適なアドバイスを提供してください。`,
        userPrompt: `症状: ${input.symptoms.join('、')}`
      };

      // Step 3: LLM Generation
      console.log('Generating response with LLM...');
      const llmResponse = await this.llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      // Step 4: Parse result
      let parsedResult;
      try {
        parsedResult = JSON.parse(llmResponse.content);
        console.log('Successfully parsed LLM JSON response');
      } catch (parseError) {
        console.warn('Failed to parse LLM response as JSON, using fallback');
        parsedResult = this.generateFallbackResult(input.symptoms);
      }

      const processingTime = Date.now() - startTime;

      return {
        result: parsedResult,
        metadata: {
          sources,
          llmResponse,
          processingTime,
          ragUsed
        }
      };

    } catch (error) {
      console.error('Diagnosis chain error:', error);
      
      // Fallback result
      const processingTime = Date.now() - startTime;
      return {
        result: this.generateFallbackResult(input.symptoms),
        metadata: {
          sources: [],
          processingTime,
          ragUsed: false,
          error: error.message
        }
      };
    }
  }

  private generateFallbackResult(symptoms: string[]): any {
    // Simple rule-based fallback
    const hasStress = symptoms.some(s => s.includes('ストレス') || s.includes('不安'));
    const hasPain = symptoms.some(s => s.includes('痛み') || s.includes('生理'));
    const hasCold = symptoms.some(s => s.includes('冷え') || s.includes('疲労'));
    
    if (hasStress) {
      return {
        category: "ストレス・メンタルケア",
        statusSummary: "心身の緊張とストレスが見られます。リラクゼーションが必要です。",
        recommendedHerbs: ["カモミール", "ラベンダー", "パッションフラワー"],
        benefits: ["リラックス効果", "睡眠改善", "ストレス軽減"],
        advice: "規則正しい睡眠を心がけ、リラックスできる時間を作りましょう。",
        instructions: "就寝1時間前に15-20分間蒸してください。",
        duration: "2-3週間",
        frequency: "毎日",
        precautions: "妊娠中は使用前に医師にご相談ください。"
      };
    } else if (hasPain) {
      return {
        category: "女性の健康サポート",
        statusSummary: "ホルモンバランスの調整が必要な状態です。",
        recommendedHerbs: ["ローズ", "ゼラニウム", "クラリセージ"],
        benefits: ["ホルモンバランス調整", "痛み緩和", "情緒安定"],
        advice: "バランスの良い食事と適度な運動を心がけましょう。",
        instructions: "月経前1週間から毎日20分間使用してください。",
        duration: "1-2ヶ月",
        frequency: "毎日",
        precautions: "妊娠中・授乳中は使用を避けてください。"
      };
    } else {
      return {
        category: "基本的な健康維持",
        statusSummary: "全体的な健康維持とリフレッシュが推奨されます。",
        recommendedHerbs: ["カモミール", "ローズマリー", "ラベンダー"],
        benefits: ["リフレッシュ効果", "血行促進", "リラックス"],
        advice: "バランスの良い生活習慣を継続しましょう。",
        instructions: "週2-3回、リラックスしたい時に15分間蒸してください。",
        duration: "継続使用推奨",
        frequency: "週2-3回",
        precautions: "体調に合わせて使用頻度を調整してください。"
      };
    }
  }
}

// Chat Chain for conversational responses
export class HerbalChatChain {
  private llm: BaseLLM;

  constructor(llm: BaseLLM) {
    this.llm = llm;
  }

  async invoke(input: {
    message: string;
    context?: any;
    conversationHistory?: ChatMessage[];
  }): Promise<ChainOutput> {
    const startTime = Date.now();

    try {
      const systemPrompt = `
あなたは親しみやすく知識豊富な健康アドバイザーです。
ハーブや自然療法、健康に関する質問に丁寧にお答えします。

特徴:
- 温かみのある親しみやすい口調
- 専門的だが分かりやすい説明
- 安全性を重視した慎重なアドバイス
- 医学的診断は行わず、一般的な健康情報を提供

回答の際は以下を心がけてください:
- 簡潔で分かりやすい表現
- 具体的で実践的なアドバイス
- 必要に応じて注意事項も含める
- 150文字以内での回答を心がける
`;

      let contextInfo = '';
      if (input.context?.diagnosis) {
        contextInfo = `
現在のユーザー状態: ${input.context.diagnosis.category}
推奨ハーブ: ${input.context.diagnosis.recommendedHerbs?.join('、')}
`;
      }

      const userPrompt = `${contextInfo}

ユーザーの質問: ${input.message}

上記の質問に対して、専門的かつ親しみやすくお答えください。`;

      const llmResponse = await this.llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]);

      const processingTime = Date.now() - startTime;

      return {
        result: llmResponse.content,
        metadata: {
          llmResponse,
          processingTime,
          ragUsed: false
        }
      };

    } catch (error) {
      console.error('Chat chain error:', error);
      
      const processingTime = Date.now() - startTime;
      return {
        result: "申し訳ございませんが、現在システムが混雑しています。しばらくしてからもう一度お試しください。",
        metadata: {
          processingTime,
          ragUsed: false,
          error: error.message
        }
      };
    }
  }
}

// Factory function to create configured chains
export function createHerbalChains(apiKey: string) {
  const llm = new OpenAILLM({
    apiKey,
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    maxTokens: 1000
  });

  return {
    llm,
    diagnosisChain: (ragChain: any) => new HerbalDiagnosisChain(llm, ragChain),
    chatChain: new HerbalChatChain(llm)
  };
}