// 必要プラグインの読み込み (var gulp = ~ でも可)
const gulp = require("gulp");

// CSS
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob'); // sassのインポートを*でまとめる
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require("css-mqpacker"); // メディアクエリーをまとる
const stylelint = require('stylelint');
const postcssReporter = require('postcss-reporter');

// webpack
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");　// webpackの設定ファイルの読み込み

// utility
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');


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
      .src('src/scss/style.scss')
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
