// RAG System Implementation inspired by LangChain
// Simulating Python-like structure in TypeScript/Deno

export interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface RetrievalResult {
  document: Document;
  score: number;
}

// Document Loader (similar to LangChain's document loaders)
export class HerbalKnowledgeLoader {
  private documents: Document[] = [
    {
      id: "stress_management",
      content: `
        ストレス管理とメンタルヘルス
        現代社会において、ストレスは避けられない要素です。慢性的なストレスは、睡眠障害、イライラ、不安、集中力の低下を引き起こします。
        
        推奨ハーブ:
        - カモミール (Chamomile): 鎮静作用があり、リラックス効果が高い
        - ラベンダー (Lavender): 神経系を鎮静し、睡眠の質を向上させる
        - パッションフラワー (Passion Flower): 不安を軽減し、心の平静を保つ
        - レモンバーム (Lemon Balm): 緊張を和らげ、気分を安定させる
        
        使用方法: 就寝1時間前に15-20分間の蒸気浴。深呼吸とともにアロマを吸入。
        注意点: 妊娠中や授乳中は使用前に医師に相談。
      `,
      metadata: {
        category: "mental_health",
        symptoms: ["stress", "anxiety", "insomnia", "irritability"],
        herbs: ["chamomile", "lavender", "passion_flower", "lemon_balm"],
        benefits: ["relaxation", "sleep_improvement", "anxiety_reduction"]
      }
    },
    {
      id: "womens_health",
      content: `
        女性特有の健康問題とホルモンバランス
        月経周期、PMS、更年期症状など、女性ホルモンの変動は多様な症状を引き起こします。
        自然なアプローチでホルモンバランスを整えることができます。
        
        推奨ハーブ:
        - ローズ (Rose): 女性ホルモンの調整、美肌効果
        - クラリセージ (Clary Sage): エストロゲン様作用、PMS症状緩和
        - ゼラニウム (Geranium): ホルモンバランス調整、情緒安定
        - チェストベリー (Chaste Tree): プロゲステロン産生促進
        
        使用方法: 月経前1週間から毎日20分間。温かい環境でリラックスして実施。
        効果: 生理痛軽減、PMS症状改善、肌質向上、情緒安定。
      `,
      metadata: {
        category: "womens_health",
        symptoms: ["menstrual_irregularity", "pms", "menopause", "hormonal_imbalance"],
        herbs: ["rose", "clary_sage", "geranium", "chaste_tree"],
        benefits: ["hormone_balance", "menstrual_relief", "skin_health"]
      }
    },
    {
      id: "circulation_warming",
      content: `
        血行促進と冷え性改善
        冷え性は血行不良が主な原因で、疲労、むくみ、代謝低下を引き起こします。
        温性のハーブを用いて体の内側から温めることが効果的です。
        
        推奨ハーブ:
        - ジンジャー (Ginger): 血行促進、体温上昇、消化改善
        - シナモン (Cinnamon): 末梢血管拡張、代謝向上
        - クローブ (Clove): 温性、抗酸化作用
        - ローズマリー (Rosemary): 血行促進、集中力向上
        
        使用方法: 入浴前に20-30分間の蒸気浴。足浴との併用も効果的。
        効果期間: 継続使用で2-3週間後に効果を実感。冬季は特に有効。
      `,
      metadata: {
        category: "circulation",
        symptoms: ["cold_sensitivity", "poor_circulation", "fatigue", "swelling"],
        herbs: ["ginger", "cinnamon", "clove", "rosemary"],
        benefits: ["circulation_improvement", "warming", "metabolism_boost"]
      }
    },
    {
      id: "detox_beauty",
      content: `
        デトックスと美容促進
        体内の老廃物蓄積は、肌荒れ、くすみ、疲労感の原因となります。
        利尿作用と抗酸化作用を持つハーブで体内浄化を促進します。
        
        推奨ハーブ:
        - ダンデライオン (Dandelion): 肝臓デトックス、利尿作用
        - ネトル (Nettle): 血液浄化、ミネラル補給
        - ローズヒップ (Rose Hip): ビタミンC豊富、抗酸化作用
        - ハイビスカス (Hibiscus): 抗酸化、美肌効果
        
        使用方法: 空腹時に25分間の蒸気浴。水分補給を十分に行う。
        頻度: 週2-3回の継続使用。過度な使用は避ける。
      `,
      metadata: {
        category: "detox_beauty",
        symptoms: ["skin_problems", "fatigue", "constipation", "dullness"],
        herbs: ["dandelion", "nettle", "rose_hip", "hibiscus"],
        benefits: ["detoxification", "skin_improvement", "antioxidant"]
      }
    },
    {
      id: "digestive_health",
      content: `
        消化器系の健康サポート
        消化不良、便秘、胃腸の不調は生活の質を大きく左下します。
        消化促進と腸内環境改善に効果的なハーブを使用します。
        
        推奨ハーブ:
        - ペパーミント (Peppermint): 消化促進、胃腸鎮静
        - フェンネル (Fennel): 腸内ガス排出、消化促進
        - ジンジャー (Ginger): 胃腸機能活性化、吐き気抑制
        - カモミール (Chamomile): 胃腸鎮静、抗炎症作用
        
        使用方法: 食後30分以降に15分間の蒸気浴。腹部マッサージとの併用推奨。
        効果: 消化促進、便秘改善、腹部膨満感軽減。
      `,
      metadata: {
        category: "digestive",
        symptoms: ["indigestion", "constipation", "bloating", "nausea"],
        herbs: ["peppermint", "fennel", "ginger", "chamomile"],
        benefits: ["digestion_improvement", "constipation_relief", "gut_health"]
      }
    }
  ];

  async loadDocuments(): Promise<Document[]> {
    return this.documents;
  }

  async loadDocumentById(id: string): Promise<Document | null> {
    return this.documents.find(doc => doc.id === id) || null;
  }
}

// Simple Vector Store (simulating embedding-based similarity search)
export class SimpleVectorStore {
  private documents: Document[] = [];

  async addDocuments(documents: Document[]): Promise<void> {
    // In a real implementation, you would generate embeddings here
    this.documents = [...this.documents, ...documents];
  }

  // Simple keyword-based similarity search (replacing vector similarity)
  async similaritySearch(query: string, k: number = 3): Promise<RetrievalResult[]> {
    const queryTokens = this.tokenize(query.toLowerCase());
    
    const results = this.documents.map(doc => {
      const contentTokens = this.tokenize(doc.content.toLowerCase());
      const metadataText = JSON.stringify(doc.metadata).toLowerCase();
      const metadataTokens = this.tokenize(metadataText);
      
      // Calculate similarity score based on token overlap
      const contentScore = this.calculateTokenOverlap(queryTokens, contentTokens);
      const metadataScore = this.calculateTokenOverlap(queryTokens, metadataTokens) * 1.5; // Boost metadata matches
      
      return {
        document: doc,
        score: contentScore + metadataScore
      };
    });

    // Sort by score and return top k results
    return results
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  private calculateTokenOverlap(tokens1: string[], tokens2: string[]): number {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    
    let overlap = 0;
    for (const token of set1) {
      if (set2.has(token)) {
        overlap++;
      }
    }
    
    return overlap / Math.max(set1.size, set2.size);
  }
}

// Retriever class (similar to LangChain retrievers)
export class HerbalKnowledgeRetriever {
  private vectorStore: SimpleVectorStore;
  private loader: HerbalKnowledgeLoader;

  constructor() {
    this.vectorStore = new SimpleVectorStore();
    this.loader = new HerbalKnowledgeLoader();
  }

  async initialize(): Promise<void> {
    const documents = await this.loader.loadDocuments();
    await this.vectorStore.addDocuments(documents);
  }

  async retrieve(query: string, k: number = 3): Promise<RetrievalResult[]> {
    return await this.vectorStore.similaritySearch(query, k);
  }

  // Advanced retrieval with filtering
  async retrieveByCategory(query: string, categories: string[], k: number = 3): Promise<RetrievalResult[]> {
    const allResults = await this.retrieve(query, 10);
    
    const filteredResults = allResults.filter(result => 
      categories.some(category => 
        result.document.metadata.category === category ||
        result.document.metadata.symptoms?.includes(category) ||
        result.document.metadata.herbs?.includes(category)
      )
    );

    return filteredResults.slice(0, k);
  }
}

// RAG Chain (similar to LangChain chains)
export class HerbalRAGChain {
  private retriever: HerbalKnowledgeRetriever;

  constructor() {
    this.retriever = new HerbalKnowledgeRetriever();
  }

  async initialize(): Promise<void> {
    await this.retriever.initialize();
  }

  async retrieveContext(symptoms: string[], userAnswers: Record<string, boolean>): Promise<{
    context: string;
    sources: Document[];
    metadata: any;
  }> {
    // Convert symptoms to search query
    const query = symptoms.join(' ') + ' ' + Object.keys(userAnswers).filter(key => userAnswers[key]).join(' ');
    
    // Retrieve relevant documents
    const results = await this.retriever.retrieve(query, 3);
    
    // Combine context from retrieved documents
    const context = results.map(result => 
      `【${result.document.metadata.category}】\n${result.document.content}\n\n`
    ).join('');

    const sources = results.map(result => result.document);
    
    const metadata = {
      totalResults: results.length,
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      categories: [...new Set(results.map(r => r.document.metadata.category))]
    };

    return { context, sources, metadata };
  }

  // Generate structured prompt for LLM
  generatePrompt(context: string, symptoms: string[], userAnswers: Record<string, boolean>): {
    systemPrompt: string;
    userPrompt: string;
  } {
    const systemPrompt = `
あなたは東洋医学とハーブ療法の専門家です。以下の知識ベースを参考に、ユーザーの症状に最適な蒸しハーブレシピとアドバイスを提案してください。

知識ベース:
${context}

回答は以下のJSON形式で返してください:
{
  "category": "診断カテゴリ名",
  "statusSummary": "現在の状態の要約（50-80文字）",
  "recommendedHerbs": ["主要ハーブ1", "主要ハーブ2", "主要ハーブ3", "補助ハーブ4"],
  "benefits": ["期待効果1", "期待効果2", "期待効果3"],
  "advice": "生活習慣に関する具体的なアドバイス（100-150文字）",
  "instructions": "蒸しレシピの詳細な使用方法（80-120文字）",
  "duration": "推奨使用期間",
  "frequency": "使用頻度",
  "precautions": "注意事項"
}

重要事項:
- 医学的診断ではなく、健康サポートの提案であることを明記
- 妊娠中・授乳中・治療中の場合は医師相談を推奨
- 個人差があることを考慮した内容にする
- 日本語で自然で親しみやすい表現を使用
`;

    const userPrompt = `
【ユーザーの症状】
${symptoms.join('、')}

【質問への回答】
${Object.entries(userAnswers)
  .filter(([_, answered]) => answered)
  .map(([question, _]) => `✓ ${question}`)
  .join('\n')}

上記の症状と回答に基づいて、最適な蒸しハーブレシピをご提案ください。
`;

    return { systemPrompt, userPrompt };
  }
}

// Export singleton instance
export const herbalRAG = new HerbalRAGChain();