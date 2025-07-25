export interface Question {
  id: string;
  category: 'M' | 'F';
  text: string;
  type: 'checkbox';
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  image: string;
}

export const questions: Question[] = [
  // M項目（メンタル・自律神経系）
  { id: 'M1', category: 'M', text: '最近イライラしやすい', type: 'checkbox' },
  { id: 'M2', category: 'M', text: '眠りが浅く、夜中に目が覚める', type: 'checkbox' },
  { id: 'M3', category: 'M', text: 'ストレスを感じることが多い', type: 'checkbox' },
  { id: 'M4', category: 'M', text: '集中力が続かない', type: 'checkbox' },
  { id: 'M5', category: 'M', text: '気分の浮き沈みが激しい', type: 'checkbox' },
  { id: 'M6', category: 'M', text: '疲れが取れにくい', type: 'checkbox' },
  { id: 'M7', category: 'M', text: '頭痛や肩こりがある', type: 'checkbox' },
  { id: 'M8', category: 'M', text: '食欲が不安定', type: 'checkbox' },
  { id: 'M9', category: 'M', text: '冷え性である', type: 'checkbox' },
  { id: 'M10', category: 'M', text: '便秘がちである', type: 'checkbox' },
  { id: 'M11', category: 'M', text: '手足がむくみやすい', type: 'checkbox' },
  
  // F項目（女性特有の症状）
  { id: 'F1', category: 'F', text: '生理周期が不規則', type: 'checkbox' },
  { id: 'F2', category: 'F', text: '生理痛がひどい', type: 'checkbox' },
  { id: 'F3', category: 'F', text: 'PMS（月経前症候群）の症状がある', type: 'checkbox' },
  { id: 'F4', category: 'F', text: '肌荒れが気になる', type: 'checkbox' },
  { id: 'F5', category: 'F', text: '髪のパサつきが気になる', type: 'checkbox' },
  { id: 'F6', category: 'F', text: '爪が割れやすい', type: 'checkbox' },
  { id: 'F7', category: 'F', text: 'ホットフラッシュがある', type: 'checkbox' },
  { id: 'F8', category: 'F', text: '体重が増加しやすい', type: 'checkbox' },
  { id: 'F9', category: 'F', text: '乾燥肌である', type: 'checkbox' },
  { id: 'F10', category: 'F', text: '目の疲れを感じる', type: 'checkbox' },
  { id: 'F11', category: 'F', text: '口の乾きを感じる', type: 'checkbox' },
  { id: 'F12', category: 'F', text: '関節の痛みがある', type: 'checkbox' },
  { id: 'F13', category: 'F', text: '記憶力の低下を感じる', type: 'checkbox' },
  { id: 'F14', category: 'F', text: '不安感を感じることが多い', type: 'checkbox' },
  { id: 'F15', category: 'F', text: '更年期の症状がある', type: 'checkbox' },
  { id: 'F16', category: 'F', text: '体力の低下を感じる', type: 'checkbox' },
];

export const recipes: Recipe[] = [
  {
    id: '1',
    name: '元気回復リフレッシュ蒸し',
    description: '疲労回復と気力向上をサポート',
    ingredients: ['よもぎ', 'ローズマリー', 'ペパーミント', 'レモングラス'],
    benefits: ['疲労回復', '集中力向上', 'リフレッシュ効果'],
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'ホルモンバランス調整蒸し',
    description: '女性ホルモンのバランスを整える',
    ingredients: ['ローズ', 'クラリセージ', 'ゼラニウム', 'ラベンダー'],
    benefits: ['ホルモンバランス調整', 'PMS緩和', '生理痛軽減'],
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    name: '安眠ゆるり蒸し',
    description: '深い眠りとリラクゼーションをサポート',
    ingredients: ['カモミール', 'ラベンダー', 'パッションフラワー', 'リンデン'],
    benefits: ['睡眠の質向上', 'リラックス効果', 'ストレス軽減'],
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'デトックス美肌蒸し',
    description: '体内浄化と美肌効果を促進',
    ingredients: ['ダンデライオン', 'ネトル', 'ローズヒップ', 'ハイビスカス'],
    benefits: ['デトックス効果', '美肌促進', 'むくみ改善'],
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    name: '温活循環蒸し',
    description: '血行促進と冷え性改善',
    ingredients: ['ジンジャー', 'シナモン', 'クローブ', 'カルダモン'],
    benefits: ['冷え性改善', '血行促進', '代謝向上'],
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
  }
];

export interface DiagnosisResult {
  statusSummary: string;
  recommendedRecipes: Recipe[];
  advice: string;
  category: string;
}

export function diagnoseRecipe(selectedAnswers: string[]): DiagnosisResult {
  const mAnswers = selectedAnswers.filter(id => id.startsWith('M'));
  const fAnswers = selectedAnswers.filter(id => id.startsWith('F'));
  
  const mScore = mAnswers.length;
  const fScore = fAnswers.length;
  
  let statusSummary = '';
  let recommendedRecipes: Recipe[] = [];
  let advice = '';
  let category = '';
  
  // 診断ロジック
  if (mScore >= 6 && fScore >= 8) {
    category = 'ストレス+ホルモンバランス';
    statusSummary = '心身の疲労とホルモンバランスの乱れが見られます';
    recommendedRecipes = [recipes[1], recipes[2]]; // ホルモンバランス + 安眠
    advice = '規則正しい生活リズムを心がけ、リラックスできる時間を作りましょう。適度な運動と質の良い睡眠が重要です。';
  } else if (mScore >= 5) {
    category = 'ストレス・疲労';
    statusSummary = '精神的・身体的な疲労とストレスが蓄積されています';
    recommendedRecipes = [recipes[0], recipes[2]]; // 元気回復 + 安眠
    advice = 'ストレス発散方法を見つけ、十分な休息を取りましょう。深呼吸や軽いストレッチも効果的です。';
  } else if (fScore >= 6) {
    category = 'ホルモンバランス・女性特有';
    statusSummary = '女性ホルモンのバランスに関する症状が多く見られます';
    recommendedRecipes = [recipes[1], recipes[3]]; // ホルモンバランス + デトックス
    advice = '女性ホルモンのバランスを整えるため、大豆製品の摂取や適度な運動を心がけましょう。';
  } else if (selectedAnswers.includes('M9') || selectedAnswers.includes('M10')) {
    category = '冷え・循環不良';
    statusSummary = '冷えや血行不良による体調不良が考えられます';
    recommendedRecipes = [recipes[4]]; // 温活循環
    advice = '体を温める食事を心がけ、入浴や適度な運動で血行を促進しましょう。';
  } else {
    category = '予防・メンテナンス';
    statusSummary = '現在の健康状態は比較的良好です';
    recommendedRecipes = [recipes[3]]; // デトックス美肌
    advice = '現在の良い状態を維持するため、バランスの取れた食事と規則正しい生活を続けましょう。';
  }
  
  return {
    statusSummary,
    recommendedRecipes,
    advice,
    category
  };
}

export interface HistoryEntry {
  id: string;
  date: Date;
  answers: string[];
  result: DiagnosisResult;
}