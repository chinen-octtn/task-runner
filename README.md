# マークアップのローカル開発環境タスクランナー gulp

Web サイト、LP 制作等のローカル開発環境の Sample テンプレートです。

JS フレームワークを使わないシンプルな HTML/CSS/JS の構築に利用できます。

こちらのリポジトリをコピーして個人・企業問わず開発に使ってかまいません。あくまでも参考用のコードのため、利用による責任は追いかねます。

## gulp タスク

- pug → HTML
- Sass（scss）→ CSS
  - Stylelint
- TypeScript → Javascript
  - ESLint
  - Webpack bundle
- Local Server
  - Hot Reload
  - Server Side Include（SSI）
- Image Optimize

## 動作確認済み環境

- macOS Big Sur 11.6.1
- node v16.13.0
- npm v8.1.0

### VS Code 拡張機能(Extensions)

[Visual Studio Code](https://azure.microsoft.com/ja-jp/products/visual-studio-code/)を推奨環境としています。

タスクと連携のため下記 Extensions を追加してください。

- EditorConfig for VS Code
- Prettier - Code formatter
- Styelint
- ESLint

### ローカル開発環境の起動

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

## ディレクトリ構成

`/src/` で開発用ファイルを管理します。

`/dist/` に各種変換/コンパイル/ビルドしたファイルが格納されます。
`/dist/` 配下のファイルは直接編集してはいけません。

gitignore で除外していますが Heroku 等の deploy 環境で Git に含む必要がある場合は、gitignore を編集してください。

ローカルサーバーでは `/dist/` ディレクトリをドキュメントルートとして表示します。

### /src/\_data

HTML の head タグに反映する meta 関連の情報を json で管理します。

### /src/img

gulp の image タスクで、画像を圧縮します。watch 状態であればこのディレクトリにファイルを追加するだけで圧縮します。

`/src/img/` 配下に作成した任意のフォルダ構造のまま公開ディレクトリ(dist)に出力します。

```
例）
/src/img/assets/img/sample.png
↓
/dist/assets/img/sample.png
```

### /src/js

gulp の js タスクで Webpack を使って TypeScript から JavaScript へ変換します。

また、分割している ts ファイルは bundle します。

`/src/js/_module/` 配下には import 用の ts ファイルを格納します。

`/src/js/` 配下に作成した任意のフォルダ構造のまま公開ディレクトリ(dist)に出力します。

```
例）
/src/js/assets/js/script.ts
↓
/dist/assets/js/script.js
```

### /src/public

gulp の copy タスクでファイルを dist へコピーします。

favicon や manifest.json 等の変換不要なファイルを設置します。

`/src/public/` 配下に作成した任意のフォルダ構造のまま公開ディレクトリ(dist)に出力します。

```
例）
/src/public/manifest.json
↓
/dist/manifest.json
```

### /src/pug

gulp の pug タスクで Pug ファイルを HTML に変換します。

`/src/pug/_include/` に extends する layout ファイルやインクルード用ファイルをまとめています。

各 pug ファイルでは `- var directory ='/'` の項目で `/src/_data/site.json` のオブジェクトのキーと紐付けることで json で指定した値を head タグに反映します。

`/src/pug/` 配下に作成した任意のフォルダ構造のまま公開ディレクトリ(dist)に出力します。

```
例）
/src/pug/sample/index.pug
↓
/dist/sample/index.html
```

### /src/scss

gulp の sass タスクで scss ファイルを css に変換します。

`/src/scss/` 配下に作成した任意のフォルダ構造のまま公開ディレクトリ(dist)に出力します。

```
例）
/src/scss/assets/css/style.scss
↓
/dist/assets/css/style.css
```

FLOCSS を参考にディレクトリを分けています。運用ルールに合わせて変更してかまいません。

```
例）
/src/scss/
  ├─ _component/・・・各ページで使えるパーツを格納
  │
  ├─ _foundation/・・・設定ファイルを格納
  │    ├─ _mixin.scss・・・mixinや関数等
  │    ├─ _reset.scss・・・リセット用のstyle
  │    └─ _var.scss・・・カスタムプロパティ（変数）
  │
  ├─ _layout/・・・header/footer等のサイト内で共通の要素
  │    ├─ _header.scss
  │    └─ _footer.scss
  │
  └─ _page・・・各ページ固有のスタイル
       ├─ _top.scss
       ├─ _list.scss
       └─ _xxx.scss
```

## 不具合があれば

[Twitter](https://twitter.com/chocodogmagic)まで連絡いただくか、プルリクエストを作成ください。

多くの Web サイト・LP の制作に使えるよう汎用化しているため、特定のプロジェクトでしか使わないような個別の機能は追加しません。

各プロジェクトごとの個別の設定は各自で判断して編集してお使いください。
