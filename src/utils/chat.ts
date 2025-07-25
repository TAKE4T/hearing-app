export interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    questionId?: string;
    isQuestion?: boolean;
    hasOptions?: boolean;
    options?: string[];
  };
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  image: string;
  instructions?: string;
}

export interface ChatState {
  messages: Message[];
  currentQuestionIndex: number;
  userAnswers: Record<string, boolean>;
  isComplete: boolean;
  diagnosis?: {
    statusSummary: string;
    recommendedRecipes: Recipe[];
    advice: string;
    category: string;
  };
}

export const healthQuestions = [
  {
    id: 'stress',
    question: '最近ストレスを感じることが多いですか？',
    category: 'mental'
  },
  {
    id: 'sleep',
    question: '眠りが浅く、夜中に目が覚めることがありますか？',
    category: 'mental'
  },
  {
    id: 'fatigue',
    question: '疲れが取れにくいと感じますか？',
    category: 'physical'
  },
  {
    id: 'cold',
    question: '冷え性でお悩みですか？',
    category: 'physical'
  },
  {
    id: 'skin',
    question: '肌荒れが気になりますか？',
    category: 'beauty'
  },
  {
    id: 'period',
    question: '生理不順や生理痛がありますか？',
    category: 'women'
  },
  {
    id: 'digestion',
    question: '便秘がちですか？',
    category: 'physical'
  },
  {
    id: 'mood',
    question: '気分の浮き沈みが激しいですか？',
    category: 'mental'
  }
];

export const recipes: Recipe[] = [
  {
    id: '1',
    name: '安眠ゆるり蒸し',
    description: '深い眠りとリラクゼーションをサポート',
    ingredients: ['カモミール', 'ラベンダー', 'パッションフラワー', 'リンデン'],
    benefits: ['睡眠の質向上', 'リラックス効果', 'ストレス軽減'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop',
    instructions: '就寝1時間前に15-20分間蒸してください。'
  },
  {
    id: '2',
    name: 'ホルモンバランス調整蒸し',
    description: '女性ホルモンのバランスを整える',
    ingredients: ['ローズ', 'クラリセージ', 'ゼラニウム', 'ラベンダー'],
    benefits: ['ホルモンバランス調整', 'PMS緩和', '生理痛軽減'],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    instructions: '生理前1週間から毎日20分間お使いください。'
  },
  {
    id: '3',
    name: '温活循環蒸し',
    description: '血行促進と冷え性改善',
    ingredients: ['ジンジャー', 'シナモン', 'クローブ', 'カルダモン'],
    benefits: ['冷え性改善', '血行促進', '代謝向上'],
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    instructions: '入浴前に20-30分間蒸して体を温めましょう。'
  },
  {
    id: '4',
    name: 'デトックス美肌蒸し',
    description: '体内浄化と美肌効果を促進',
    ingredients: ['ダンデライオン', 'ネトル', 'ローズヒップ', 'ハイビスカス'],
    benefits: ['デトックス効果', '美肌促進', 'むくみ改善'],
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=300&fit=crop',
    instructions: '週2-3回、朝の空腹時に25分間蒸してください。'
  }
];

export function generateDiagnosis(answers: Record<string, boolean>) {
  const symptoms = Object.entries(answers).filter(([_, value]) => value).map(([key, _]) => key);
  
  let category = '';
  let statusSummary = '';
  let recommendedRecipes: Recipe[] = [];
  let advice = '';
  
  // 簡単な診断ロジック
  if (symptoms.includes('stress') || symptoms.includes('mood')) {
    category = 'ストレス・メンタルケア';
    statusSummary = '心の疲労やストレスが溜まっている状態です。リラックスが必要です。';
    recommendedRecipes = [recipes[0]]; // 安眠蒸し
    advice = 'まずは十分な睡眠とリラックスタイムを確保しましょう。';
  } else if (symptoms.includes('period') || symptoms.includes('skin')) {
    category = 'ホルモンバランス・美容';
    statusSummary = 'ホルモンバランスが乱れているかもしれません。';
    recommendedRecipes = [recipes[1], recipes[3]]; // ホルモンバランス + 美肌
    advice = '規則正しい生活とバランスの良い食事を心がけましょう。';
  } else if (symptoms.includes('cold') || symptoms.includes('fatigue')) {
    category = '冷え・血行不良';
    statusSummary = '体の冷えや血行不良が見られます。温活がおすすめです。';
    recommendedRecipes = [recipes[2]]; // 温活循環
    advice = '体を温める食事と適度な運動で血行を改善しましょう。';
  } else {
    category = '健康維持';
    statusSummary = '現在の健康状態は良好です。予防的なケアを続けましょう。';
    recommendedRecipes = [recipes[3]]; // デトックス美肌
    advice = 'バランスの良い生活習慣を維持していきましょう。';
  }
  
  return {
    statusSummary,
    recommendedRecipes,
    advice,
    category
  };
}