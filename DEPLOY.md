# 検査計画システム（React版）公開手順
## GitHub → Vercel で無料公開

---

## 📁 ファイル構成

```
inspection-planner/
├── index.html          ← エントリーHTML
├── package.json        ← 依存関係
├── vite.config.js      ← ビルド設定
├── .gitignore
└── src/
    ├── main.jsx        ← Reactマウント
    └── App.jsx         ← アプリ本体（inspection-planner.jsx をリネーム）
```

---

## Step 1：Node.jsのインストール（未インストールの場合）

https://nodejs.org から LTS版をダウンロードしてインストール

---

## Step 2：ローカルで動作確認

```bash
cd inspection-planner        # プロジェクトフォルダに移動
npm install                  # 依存ライブラリをインストール
npm run dev                  # 開発サーバー起動
```

ブラウザで http://localhost:5173 を開いて確認

---

## Step 3：GitHubにアップロード

1. https://github.com で新しいリポジトリを作成
   - Repository name: inspection-planner
   - Public または Private どちらでもOK

2. ターミナルで以下を実行：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/【あなたのID】/inspection-planner.git
git push -u origin main
```

---

## Step 4：Vercelにデプロイ

1. https://vercel.com にGitHubアカウントでサインイン

2. 「Add New Project」をクリック

3. GitHubから `inspection-planner` リポジトリを選択して「Import」

4. 設定はそのままで「Deploy」をクリック

5. 数分後に https://inspection-planner-xxx.vercel.app のURLが発行される

---

## ✅ 完了！

以後 `git push` するたびに自動で再デプロイされます。

---

## ⚠️ 注意：データの保存について

React版はデータをブラウザのメモリに保存しているため、
**ページをリロードするとデータがリセット**されます。

データを永続化したい場合は：
- localStorage対応版に改修（Claudeに依頼できます）
- Python版（Supabase対応）を使う
