module.exports = {
  // モード値を production に設定すると最適化された状態で、
  // development に設定するとソースマップ有効でJSファイルが出力される
  // mode: "production",
  mode: 'development',

  // 出力ファイル
  output: {
    filename: '[name].js',
  },
}
