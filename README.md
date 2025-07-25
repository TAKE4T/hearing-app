# Hearing App - 薬草蒸し診断システム

RAG（Retrieval-Augmented Generation）システムを統合した薬草蒸し診断アプリケーションです。

## 機能

- 🌿 AI診断による個人化された薬草蒸しレシピ推奨
- 💬 チャットベースの診断インターフェース
- 📊 症状スコアリングシステム
- 🔍 RAGシステムによる知識ベース検索
- 📱 レスポンシブデザイン

## 技術スタック

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Supabase Functions
- **Database**: Supabase PostgreSQL
- **Deployment**: AWS Amplify

## 開発環境セットアップ

1. **リポジトリのクローン**
```bash
git clone https://github.com/TAKE4T/hearing-app.git
cd hearing-app
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
```bash
cp .env.example .env.local
```

`.env.local`を編集して以下を設定：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **開発サーバーの起動**
```bash
npm run dev
```

## AWS Amplifyでのデプロイ

### 1. Amplify Console での設定

1. AWS Amplify Console にアクセス
2. 「新しいアプリ」→「Webアプリをホスト」を選択
3. GitHubリポジトリを接続

### 2. ビルド設定

Amplify は `amplify.yml` を自動検出します。カスタマイズが必要な場合：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 3. 環境変数の設定

Amplify Console で以下の環境変数を設定：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabaseプロジェクト URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Key

### 4. デプロイ

設定完了後、Amplify が自動的にデプロイを開始します。

## プロジェクト構造

```
src/
├── components/          # UIコンポーネント
│   ├── ui/             # shadcn/ui コンポーネント
│   ├── ChatMessage.tsx
│   ├── ChatInput.tsx
│   └── RecipeCard.tsx
├── pages/              # Next.js ページ
│   ├── api/           # API ルート
│   └── index.tsx      # メインページ
├── utils/             # ユーティリティ関数
├── styles/            # スタイル
└── supabase/          # Supabase設定とRAGシステム
    └── functions/
        └── server/
            └── rag_system.tsx
```

## RAGシステムについて

このアプリは独自のRAGシステムを実装しており、以下のデータソースを統合しています：

- **shindan.json**: レシピデータ（リズム巡り蒸し、デトックス蒸し、安眠ゆるり蒸し）
- **shojo.json**: 症状データ（M1-M11, F1-F16の症状分類）
- **一般的なハーブ知識**: 基本的なハーブ療法の情報

## API エンドポイント

- `POST /api/rag-diagnosis`: RAGシステムを使用した診断実行

## トラブルシューティング

### ビルドエラー

1. `node_modules`を削除して再インストール：
```bash
rm -rf node_modules package-lock.json
npm install
```

2. TypeScriptエラーが発生する場合：
```bash
npm run build
```

### Amplifyデプロイエラー

1. 環境変数が正しく設定されているか確認
2. `amplify.yml`の設定を確認
3. ビルドログを確認して詳細なエラーメッセージを調査

## 貢献

1. フォークを作成
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## デプロイメント状況

✅ AWS Amplify でのデプロイが成功しました！

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。