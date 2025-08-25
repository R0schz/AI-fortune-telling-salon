# AI占いサロン

AI占いサロンは、タロット占い、ホロスコープ、AIチャットなどの機能を提供するWebアプリケーションです。

## 機能

- 🃏 タロット占い（22枚の大アルカナ）
- ⭐ ホロスコープ（西洋占星術）
- 💬 AIチャット（運勢相談）
- 👤 ユーザープロファイル管理
- 🎫 チケットシステム

## 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript
- **スタイリング**: Tailwind CSS, shadcn/ui
- **バックエンド**: Supabase (認証、データベース、Edge Functions)
- **占術ライブラリ**: circular-natal-horoscope-js

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

プロジェクトルートに`.env.local`ファイルを作成し、以下の内容を記載してください：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Development Configuration
NODE_ENV=development
```

**⚠️ 重要**: `.env.local`ファイルは機密情報を含むため、Gitにコミットしないでください。

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで`http://localhost:3000`にアクセスしてください。

## セキュリティ

- 機密情報（APIキーなど）は環境変数として管理
- `.gitignore`で機密ファイルを除外
- SupabaseのRow Level Security (RLS)を活用

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
