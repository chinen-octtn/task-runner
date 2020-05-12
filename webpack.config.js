module.exports = {
  // メインとなるJavaScriptファイル（エントリーポイント）
  entry: `./src/index.js`,
  // mode: “development” or “production”,
  mode: "development",
  // ファイルの出力設定
  output: {
    //  出力ファイルのディレクトリ名
    // path: `${__dirname}/dist`,
    // 出力ファイル名
    filename: "main.js"
  },

  // ローカル開発用環境を立ち上げる
  // 実行時にブラウザが自動的に localhost を開く
  devServer: {
    contentBase: "dist", // root
    open: true
  }
};
