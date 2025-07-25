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

// JSON Data Loader for external knowledge files
export class JSONKnowledgeLoader {
  async loadShindanData(): Promise<Document[]> {
    try {
      // In production, this would read from an actual file or API
      const shindanData = {
        "recipes": [
          {
            "id": "recipe_001",
            "title": "リズム巡り蒸し",
            "type": "レシピ",
            "categories": ["ホルモン", "血虚", "瘀血"],
            "symptoms": ["月経不順", "更年期症状", "肩こり", "冷え", "血の滞り", "月経血が少ない", "ため息が多い", "やる気が出ない", "顔色が悪い", "肌が乾燥しやすい"],
            "description": "血流を促進し、ホルモンバランスを整える蒸しケア。月経周期の乱れ、更年期の不調、血虚・瘀血タイプに向いています。",
            "herbs": ["よもぎ", "当帰", "紅花", "玫瑰花", "陳皮"]
          },
          {
            "id": "recipe_002",
            "title": "デトックス蒸し",
            "type": "レシピ",
            "categories": ["免疫", "水滞", "脾虚"],
            "symptoms": ["むくみ", "花粉症", "アレルギー", "水分代謝の乱れ", "トイレが近い", "汗が多い・少ない", "舌の周りに歯の痕がつく", "のどが渇くが水を飲みたくない"],
            "description": "体内の余分な水分や老廃物を排出し、免疫バランスを整える蒸しケア。水の巡りが滞っている方におすすめです。",
            "herbs": ["よもぎ", "益母草", "桃の葉", "ローズマリー"]
          },
          {
            "id": "recipe_003",
            "title": "安眠ゆるり蒸し",
            "type": "レシピ",
            "categories": ["自律神経", "腎精", "気虚", "ストレス"],
            "symptoms": ["不眠", "神経過敏", "耳鳴り", "夢が多い", "老化", "寝つきが悪い", "緊張しやすい", "情緒不安定", "音や光に敏感", "朝が苦手", "疲れやすい", "腰や膝に力が入らない"],
            "description": "自律神経を整え、深いリラックスを促す蒸しケア。ストレス・疲労・加齢による不調におすすめです。",
            "herbs": ["よもぎ", "イチョウ葉", "当帰", "カモミール", "枇杷の葉"]
          }
        ]
      };

      return shindanData.recipes.map(recipe => ({
        id: recipe.id,
        content: `
          ${recipe.title}
          
          【カテゴリ】: ${recipe.categories.join(', ')}
          
          【対象症状】: ${recipe.symptoms.join(', ')}
          
          【説明】: ${recipe.description}
          
          【使用ハーブ】: ${recipe.herbs.join(', ')}
          
          【レシピタイプ】: ${recipe.type}
        `,
        metadata: {
          type: "recipe",
          title: recipe.title,
          categories: recipe.categories,
          symptoms: recipe.symptoms,
          herbs: recipe.herbs,
          description: recipe.description
        }
      }));
    } catch (error) {
      console.error('Error loading shindan data:', error);
      return [];
    }
  }

  async loadShojoData(): Promise<Document[]> {
    try {
      const shojoQuestions = [
        { id: "M1", text: "寝つきが悪く、夜中に目が覚める", category: "自律神経", recipe: "安眠ゆるり蒸し" },
        { id: "M2", text: "緊張しやすく、心配ごとが頭から離れない", category: "自律神経", recipe: "安眠ゆるり蒸し" },
        { id: "M3", text: "朝が苦手で、ぼーっとしてしまう", category: "自律神経", recipe: "安眠ゆるり蒸し" },
        { id: "M4", text: "急にイライラしたり涙が出たり、情緒が不安定になる", category: "自律神経", recipe: "安眠ゆるり蒸し" },
        { id: "M5", text: "音や光に敏感になりやすい", category: "自律神経", recipe: "安眠ゆるり蒸し" },
        { id: "M6", text: "月経のリズムが安定しない", category: "ホルモン", recipe: "リズム巡り蒸し" },
        { id: "M7", text: "更年期症状が気になる（ほてり、イライラなど）", category: "ホルモン", recipe: "リズム巡り蒸し" },
        { id: "M8", text: "月経前に胸の張りや気分の波がある", category: "ホルモン", recipe: "リズム巡り蒸し" },
        { id: "M9", text: "月経痛が強い or 急に重くなった", category: "ホルモン", recipe: "リズム巡り蒸し" },
        { id: "M10", text: "花粉症・鼻炎・アトピーなどがある", category: "免疫", recipe: "デトックス蒸し" },
        { id: "M11", text: "アレルギーや自己免疫に関する不調がある", category: "免疫", recipe: "デトックス蒸し" },
        { id: "F1", text: "疲れやすく、だるさが取れない", category: "気", recipe: "安眠ゆるり蒸し" },
        { id: "F2", text: "ため息が多く、やる気が出ない", category: "気", recipe: "リズム巡り蒸し" },
        { id: "F3", text: "お腹が張りやすく、ガスがたまりやすい", category: "気", recipe: "リズム巡り蒸し" },
        { id: "F4", text: "顔色が悪く、肌が乾燥しやすい", category: "血", recipe: "リズム巡り蒸し" },
        { id: "F5", text: "月経の血量が少ない／色が薄い", category: "血", recipe: "リズム巡り蒸し" },
        { id: "F6", text: "肩こり・冷え性・経血に塊がある", category: "血（瘀血）", recipe: "リズム巡り蒸し" },
        { id: "F7", text: "唇や爪の色が白っぽくなる", category: "血", recipe: "リズム巡り蒸し" },
        { id: "F8", text: "むくみやすく、身体が重だるい", category: "水", recipe: "デトックス蒸し" },
        { id: "F9", text: "トイレが近い／汗が多い or 少ない", category: "水", recipe: "デトックス蒸し" },
        { id: "F10", text: "舌の周りに歯の痕がつきやすい", category: "水（脾虚）", recipe: "デトックス蒸し" },
        { id: "F11", text: "のどが渇くのに水を飲みたくない", category: "水（津液失調）", recipe: "デトックス蒸し" },
        { id: "F12", text: "抜け毛や白髪が気になる", category: "精（腎精）", recipe: "安眠ゆるり蒸し" },
        { id: "F13", text: "眠りが浅く、夢をよく見る", category: "精", recipe: "安眠ゆるり蒸し" },
        { id: "F14", text: "老化や生殖力の衰えを感じる", category: "精", recipe: "安眠ゆるり蒸し" },
        { id: "F15", text: "耳鳴り・難聴・めまいがある", category: "精（腎虚）", recipe: "安眠ゆるり蒸し" },
        { id: "F16", text: "腰や膝に力が入らない・だるい", category: "精（腎虚）", recipe: "安眠ゆるり蒸し" }
      ];

      return shojoQuestions.map(q => ({
        id: q.id,
        content: `
          症状ID: ${q.id}
          症状内容: ${q.text}
          
          この症状は${q.category}の乱れに関係しており、${q.recipe}によるケアが有効とされています。
          
          東洋医学の観点から、${q.category}の不調は体のバランスが崩れている状態を示しており、
          適切なハーブ蒸しケアによって体質改善を図ることができます。
        `,
        metadata: {
          type: "symptom",
          symptomId: q.id,
          symptomText: q.text,
          category: q.category,
          recommendedRecipe: q.recipe,
          categoryType: q.id.startsWith('M') ? 'main_symptom' : 'functional_symptom'
        }
      }));
    } catch (error) {
      console.error('Error loading shojo data:', error);
      return [];
    }
  }
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
  private jsonLoader: JSONKnowledgeLoader;

  constructor() {
    this.vectorStore = new SimpleVectorStore();
    this.loader = new HerbalKnowledgeLoader();
    this.jsonLoader = new JSONKnowledgeLoader();
  }

  async initialize(): Promise<void> {
    // Load all document sources
    const herbalDocuments = await this.loader.loadDocuments();
    const recipeDocuments = await this.jsonLoader.loadShindanData();
    const symptomDocuments = await this.jsonLoader.loadShojoData();
    
    // Combine all documents
    const allDocuments = [...herbalDocuments, ...recipeDocuments, ...symptomDocuments];
    await this.vectorStore.addDocuments(allDocuments);
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

// Diagnostic Logic Engine
export class DiagnosticEngine {
  private categoryScores: Map<string, number> = new Map();

  // Calculate scores based on user responses
  calculateScores(userResponses: Record<string, boolean>): Map<string, number> {
    this.categoryScores.clear();
    
    // Define category mappings based on symptom patterns
    const categoryMappings = {
      'M1,M2,M3,M4,M5': '自律神経',
      'M6,M7,M8,M9': 'ホルモン',
      'M10,M11': '免疫',
      'F1': '気',
      'F2,F3': '気',
      'F4,F5,F7': '血',
      'F6': '血（瘀血）',
      'F8,F9,F10,F11': '水',
      'F12,F13,F14,F15,F16': '精'
    };

    // Calculate individual category scores
    for (const [symptoms, category] of Object.entries(categoryMappings)) {
      const symptomIds = symptoms.split(',');
      let score = 0;
      
      for (const symptomId of symptomIds) {
        if (userResponses[symptomId] === true) {
          score++;
        }
      }
      
      this.categoryScores.set(category, (this.categoryScores.get(category) || 0) + score);
    }

    // Calculate combined scores for diagnostic logic
    const combinedScores = new Map<string, number>();
    
    // ホルモン + 血系統
    const hormoneBluodScore = (this.categoryScores.get('ホルモン') || 0) + 
                             (this.categoryScores.get('血') || 0) + 
                             (this.categoryScores.get('血（瘀血）') || 0);
    combinedScores.set('ホルモン・血系', hormoneBluodScore);
    
    // 免疫 + 水系統  
    const immuneWaterScore = (this.categoryScores.get('免疫') || 0) + 
                            (this.categoryScores.get('水') || 0);
    combinedScores.set('免疫・水系', immuneWaterScore);
    
    // 自律神経 + 精 + 気系統
    const nerveEnergyScore = (this.categoryScores.get('自律神経') || 0) + 
                            (this.categoryScores.get('精') || 0) + 
                            (this.categoryScores.get('気') || 0);
    combinedScores.set('自律神経・精・気系', nerveEnergyScore);

    return combinedScores;
  }

  // Determine recommended recipe based on scores
  getRecommendation(scores: Map<string, number>): {
    primaryRecipe: string;
    secondaryRecipe?: string;
    logic: string;
    confidence: number;
  } {
    const scoresArray = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    const totalResponses = Array.from(scores.values()).reduce((sum, score) => sum + score, 0);
    
    // Check for very low response count
    if (totalResponses <= 3) {
      return {
        primaryRecipe: '診断継続',
        logic: 'チェック数が少なすぎます。より多くの項目をチェックして再診断してください。',
        confidence: 0.1
      };
    }

    const topScore = scoresArray[0];
    const secondScore = scoresArray[1];
    
    // Single recipe recommendation (2+ point difference)
    if (topScore[1] - secondScore[1] >= 2) {
      const recipeMap = {
        'ホルモン・血系': 'リズム巡り蒸し',
        '免疫・水系': 'デトックス蒸し',
        '自律神経・精・気系': '安眠ゆるり蒸し'
      };
      
      return {
        primaryRecipe: recipeMap[topScore[0] as keyof typeof recipeMap] || 'リズム巡り蒸し',
        logic: `${topScore[0]}のスコアが最も高く、他と2点以上差があるため単独推奨`,
        confidence: 0.8
      };
    }
    
    // Mixed recipe recommendation (1 point or less difference)
    if (topScore[1] - secondScore[1] <= 1) {
      const recipeMap = {
        'ホルモン・血系': 'リズム巡り蒸し',
        '免疫・水系': 'デトックス蒸し',
        '自律神経・精・気系': '安眠ゆるり蒸し'
      };
      
      return {
        primaryRecipe: recipeMap[topScore[0] as keyof typeof recipeMap] || 'リズム巡り蒸し',
        secondaryRecipe: recipeMap[secondScore[0] as keyof typeof recipeMap] || 'デトックス蒸し',
        logic: `上位2カテゴリのスコア差が1点以内で拮抗しているため併用提案`,
        confidence: 0.9
      };
    }

    // Default fallback
    return {
      primaryRecipe: 'リズム巡り蒸し',
      logic: 'デフォルト推奨',
      confidence: 0.5
    };
  }
}

// RAG Chain (similar to LangChain chains)
export class HerbalRAGChain {
  private retriever: HerbalKnowledgeRetriever;
  private diagnosticEngine: DiagnosticEngine;

  constructor() {
    this.retriever = new HerbalKnowledgeRetriever();
    this.diagnosticEngine = new DiagnosticEngine();
  }

  async initialize(): Promise<void> {
    await this.retriever.initialize();
  }

  // Enhanced diagnostic method with RAG integration
  async performDiagnosis(userResponses: Record<string, boolean>): Promise<{
    diagnosis: any;
    context: string;
    sources: Document[];
    metadata: any;
  }> {
    // Step 1: Calculate diagnostic scores
    const scores = this.diagnosticEngine.calculateScores(userResponses);
    const recommendation = this.diagnosticEngine.getRecommendation(scores);
    
    // Step 2: Create search query based on diagnosis
    const searchTerms = [recommendation.primaryRecipe];
    if (recommendation.secondaryRecipe) {
      searchTerms.push(recommendation.secondaryRecipe);
    }
    
    // Add active symptoms to search
    const activeSymptoms = Object.keys(userResponses).filter(key => userResponses[key]);
    const query = [...searchTerms, ...activeSymptoms].join(' ');
    
    // Step 3: Retrieve relevant documents
    const results = await this.retriever.retrieve(query, 5);
    
    // Step 4: Filter results to focus on recipe and symptom documents
    const recipeResults = results.filter(r => r.document.metadata.type === 'recipe');
    const symptomResults = results.filter(r => r.document.metadata.type === 'symptom');
    const generalResults = results.filter(r => !r.document.metadata.type || r.document.metadata.type === 'general');
    
    // Step 5: Build comprehensive context
    const context = this.buildDiagnosticContext(recipeResults, symptomResults, generalResults, recommendation);
    
    const sources = results.map(result => result.document);
    
    const metadata = {
      totalResults: results.length,
      avgScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      categories: [...new Set(results.map(r => r.document.metadata.category))],
      scores: Object.fromEntries(scores),
      recommendation: recommendation
    };

    return { 
      diagnosis: recommendation, 
      context, 
      sources, 
      metadata 
    };
  }

  private buildDiagnosticContext(recipeResults: RetrievalResult[], symptomResults: RetrievalResult[], generalResults: RetrievalResult[], recommendation: any): string {
    let context = '';
    
    // Add diagnostic summary
    context += `【診断結果】\n`;
    context += `推奨レシピ: ${recommendation.primaryRecipe}\n`;
    if (recommendation.secondaryRecipe) {
      context += `併用レシピ: ${recommendation.secondaryRecipe}\n`;
    }
    context += `根拠: ${recommendation.logic}\n`;
    context += `信頼度: ${(recommendation.confidence * 100).toFixed(0)}%\n\n`;
    
    // Add recipe information
    if (recipeResults.length > 0) {
      context += `【レシピ詳細】\n`;
      recipeResults.forEach(result => {
        context += `${result.document.content}\n\n`;
      });
    }
    
    // Add relevant symptom information
    if (symptomResults.length > 0) {
      context += `【関連症状情報】\n`;
      symptomResults.slice(0, 3).forEach(result => {
        context += `${result.document.content}\n\n`;
      });
    }
    
    // Add general herbal knowledge
    if (generalResults.length > 0) {
      context += `【参考情報】\n`;
      generalResults.slice(0, 2).forEach(result => {
        context += `${result.document.content}\n\n`;
      });
    }
    
    return context;
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