# マークアップのローカル開発環境タスクランナー gulp

※2021/11/10 Node v16 に対応するため調整中

Web サイト、LP 制作等のローカル開発環境のテンプレート。

JS フレームワークを使わないようなシンプルな HTML/CSS/JS の構築に利用できます。

### gulp タスク

- pug → HTML
- Sass（scss）→ CSS
  - Stylelint
- TypeScript → Javascript
  - ESLint
- Local Server
  - Hot Reload
  - Server Side Include（SSI）
- Image Optimize

### VS Code 拡張

- EditorConfig for VS Code
- Prettier - Code formatter
- Styelint
- ESLint

## 動作確認環境

- node v16.13.0
- npm v8.1.0

## ローカル開発環境の起動

初回のみ

```
npm i
```

```
npm start
```

2 回目以降

```
npm start
```
