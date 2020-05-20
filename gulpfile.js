// 必要プラグインの読み込み (var gulp = ~ でも可)
const gulp = require("gulp");

// CSS
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require("css-mqpacker"); // メディアクエリーをまとる
// const cleanCSS = require('gulp-clean-css'); // Sassを圧縮する

// webpack
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
// webpackの設定ファイルの読み込み
const webpackConfig = require("./webpack.config");

// utility
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');


// Sass
// scss -> css
sass.compiler = require('dart-sass');
function css() {
  const plugins = [
    autoprefixer({ grid: 'autoplace' }),
    mqpacker()
  ];
  return (
    gulp
      .src('src/scss/style.scss')
      // globパターンでのインポート機能を追加
      .pipe(sassGlob())
      .pipe(
        sass({
          outputStyle: 'expanded',
        }).on('error', sass.logError),
      )
      .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
      .pipe(postcss(plugins))
      // .pipe(
      //   cleanCSS({
      //     // ↓圧縮するかしないか
      //     // format: 'beautify',
      //     compatibility: {
      //       properties: {
      //         // 0の単位を不必要な場合は削除する
      //         zeroUnits: false,
      //       },
      //     },
      //   }),
      // )
      .pipe(
        gulp.dest('dist/assets/css/'),
      )
      // .pipe(browserSync.reload({ stream: true }))
  );
}

exports.css = css;

// タスクの定義。 ()=> の部分はfunction() でも可
gulp.task("default", () => {
  // ☆ webpackStreamの第2引数にwebpackを渡す☆
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest("dist"));
});
