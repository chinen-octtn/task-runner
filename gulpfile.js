// 必要プラグインの読み込み (var gulp = ~ でも可)
const gulp = require('gulp');

// CSS
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob'); // sassのインポートを*でまとめる
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker'); // メディアクエリーをまとる
const stylelint = require('stylelint');
const postcssReporter = require('postcss-reporter');

// local server
const browserSync = require('browser-sync');
const browserSyncSsi = require('browsersync-ssi');

// webpack
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');　// webpackの設定ファイルの読み込み

// utility
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

/**
 * 開発用ディレクトリ
 */
const src = {
  root: 'src/',
  // html: ['src/**/*.pug', '!src/**/_*.pug'],
  // htmlWatch: ['src/**/*.pug', 'src/_data/**/*.json'],
  // data: 'src/_data/',
  css: './src/scss/main.scss',
  cssWatch: 'src/**/*.scss',
  jsWatch: 'src/**/*.js',
  // image: 'src/img/**/*.{png,jpg,gif,svg,ico}',
  // imageWatch: 'src/assets/img/**/*',
};
//　ここで指定したパスが↓dest時に引き継がれる

/**
 * 公開用ディレクトリ
 */
const dest = {
  root: 'dist/',
  // image: 'dist/assets/img/',
  css: 'dist/assets/css/',
  js: 'dist/assets/js/',
};


// Sass
// scss -> css
sass.compiler = require('dart-sass');
function css() {
  const lintPlugins = [
    stylelint(),
    postcssReporter({ clearMessages: true }),
  ];
  const formatPlugins = [
    autoprefixer({ grid: 'autoplace' }),
    mqpacker(),
  ];
  return (
    gulp
      .src(src.css)
      // globパターンでのインポート機能を追加
      .pipe(sassGlob())
      .pipe(postcss(lintPlugins))
      .pipe(
        sass({
          outputStyle: 'expanded', // expanded or compressed
        }).on('error', sass.logError),
      )
      .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
      .pipe(postcss(formatPlugins))
      .pipe(
        gulp.dest(dest.css),
      )
      // .pipe(browserSync.reload({ stream: true }))
  );
}
exports.css = css;


function js() {
  return (
    webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(dest.js))
  );
}
exports.js = js;

/**
* ローカルサーバーを起動
*/
function serve(done) {
  // const httpsOption =
  //   process.env.HTTPS_KEY !== undefined
  //     ? { key: process.env.HTTPS_KEY, cert: process.env.HTTPS_CERT }
  //     : false;
  browserSync({
    server: {
      // SSIを使用
      middleware: [
        browserSyncSsi({
          baseDir: dest.root,
          ext: '.html',
        }),
      ],
      baseDir: dest.root,
    },
    // ローカルでhttpsを有効にする場合はコメントアウトを解除、認証用の.envファイルを用意する
    // https: httpsOption,
    // 共有画面でスクロールやクリックをミラーリングする場合はtrueにする
    ghostMode: false,
    // ローカルIPアドレスでサーバーを立ち上げ
    open: 'external',
    // サーバー起動時に表示するページを指定
    startPath: '/',
    // サーバー起動時にポップアップを表示させない場合はfalse
    notify: false,
  });
  done();
}
exports.serve = serve;



// 監視
function watch() {
  // gulp.watch(src.htmlWatch, html);
  // gulp.watch(src.imageWatch, image);
  gulp.watch(src.cssWatch, css);
  gulp.watch(src.jsWatch, js);
}
exports.watch = watch;


// タスクの定義。 ()=> の部分はfunction() でも可
gulp.task("default", () => {
  return
});
