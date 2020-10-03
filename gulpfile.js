// 必要プラグインの読み込み
const gulp = require('gulp');

// Pug
const gulpPug = require('gulp-pug');
const fs = require('fs');
// const data = require('gulp-data'); // Pugで多言語対応したい場合は解除
// const path = require('path'); // Pugで多言語対応したい場合は解除

// Sass
const gulpSass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob'); // sassのインポートを*でまとめる
const postcss = require('gulp-postcss');
const postcssSyntax = require('postcss-scss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker'); // メディアクエリーをまとる
const stylelint = require('stylelint');
const postcssReporter = require('postcss-reporter');

// Image
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// Local server
const browserSync = require('browser-sync');
const browserSyncSsi = require('browsersync-ssi');

// webpack
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');　// webpackの設定ファイルの読み込み

// Utility
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const changed = require('gulp-changed');

/**
 * 開発用ディレクトリ
 */
const src = {
  root: 'src/',
  data: 'src/_data/',
  pug: 'src/pug/',
  html: ['src/pug/**/*.pug', '!src/pug/**/_*.pug'],
  htmlWatch: ['src/**/*.pug', 'src/_data/**/*.json'],
  css: ['./src/scss/**/*.scss', '!./src/scss/**/_*.scss'],
  cssWatch: 'src/**/*.scss',
  jsWatch: 'src/**/*.js',
  image: 'src/img/**/*.{png,jpg,gif,svg,ico}',
  imageWatch: 'src/img/**/*',
};
//　ここで指定したパスが↓dest時に引き継がれる

/**
 * 公開用ディレクトリ
 */
const dest = {
  root: 'dist/',
  image: 'dist/assets/img/',
  css: 'dist/assets/css/',
  js: 'dist/assets/js/',
};


// Pug
// .pug -> .html
function pug() {
  // JSONファイルの読み込み。
  const locals = {
    site: JSON.parse(fs.readFileSync(`${src.data}/site.json`)),
  };
  // locals.ja = {
  //   // 日本語サイト
  //   site: JSON.parse(fs.readFileSync(`${src.data}ja/site.json`)),
  // };
  // locals.en = {
  //   // 英語サイト
  //   site: JSON.parse(fs.readFileSync(`${src.data}en/site.json`)),
  // };
  return (
    gulp
      .src(src.html)
      .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
      // .pipe(
      //   data(file => {
      //     // 各ページのルート相対パスを格納します。
      //     locals.pageAbsolutePath = `/${path
      //       .relative(file.base, file.path.replace(/.pug$/, '.html'))
      //       .replace(/index\.html$/, '')}`;
      //     return locals;
      //   }),
      // )
      // .pipe(cache('html'))
      .pipe(
        gulpPug({
          // `locals`に渡したデータを各Pugファイルで取得できます。
          locals,
          // ルート相対パスでincludeが使えるようにします。
          basedir: src.pug,
          // Pugファイルの整形。
          pretty: true,
        }),
      )
      .pipe(gulp.dest(dest.root))
      .pipe(browserSync.reload({ stream: true }))
  );
}
exports.pug = pug;


// Sass
// scss -> css
gulpSass.compiler = require('dart-sass');
function sass() {
  const lintPlugins = [
    stylelint(),
    postcssReporter({ clearMessages: true }),
  ];
  const formatPlugins = [
    autoprefixer(),
    mqpacker(),
  ];
  return (
    gulp
      .src(src.css)
      // globパターンでのインポート機能を追加
      .pipe(sassGlob())
      .pipe(postcss(lintPlugins, {
        syntax: postcssSyntax
      }))
      .pipe(
        gulpSass({
          outputStyle: 'expanded', // expanded or compressed
        }).on('error', gulpSass.logError),
      )
      .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
      .pipe(postcss(formatPlugins, {
        syntax: postcssSyntax
      }))
      .pipe(
        gulp.dest(dest.css),
      )
      .pipe(browserSync.reload({ stream: true }))
  );
}
exports.sass = sass;

/**
* JS
* ES6をWebpackでbundle + ES5に変換
*/
function js() {
  return (
    webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest(dest.js))
    .pipe(browserSync.reload({ stream: true }))
  );
}
exports.js = js;


/**
 * 画像を圧縮
 */
function image() {
  return gulp
    .src(src.image)
    .pipe(changed(dest.image))
    .pipe(
      plumber({
        errorHandler(err) {
          // eslint-disable-next-line no-console
          console.log(err.messageFormatted);
          this.emit('end');
        },
      }),
    )
    .pipe(
      imagemin([
        imageminMozjpeg({
          // 画質
          quality: 70,
        }),
        imageminPngquant({
          // 画質
          quality: [0.7, 0.8],
        }),
        imagemin.svgo({
          plugins: [
            // viewBox属性を削除する（widthとheight属性がある場合）。
            // 表示が崩れる原因になるので削除しない。
            { removeViewBox: false },
            // <metadata>を削除する。
            // 追加したmetadataを削除する必要はない。
            { removeMetadata: false },
            // SVGの仕様に含まれていないタグや属性、id属性やversion属性を削除する。
            // 追加した要素を削除する必要はない。
            { removeUnknownsAndDefaults: false },
            // コードが短くなる場合だけ<path>に変換する。
            // アニメーションが動作しない可能性があるので変換しない。
            { convertShapeToPath: false },
            // 重複や不要な`<g>`タグを削除する。
            // アニメーションが動作しない可能性があるので変換しない。
            { collapseGroups: false },
            // SVG内に<style>や<script>がなければidを削除する。
            // idにアンカーが貼られていたら削除せずにid名を縮小する。
            // id属性は動作の起点となることがあるため削除しない。
            { cleanupIDs: false },
          ],
        }),
        imagemin.optipng(),
        imagemin.gifsicle(),
      ]),
    )
    .pipe(gulp.dest(dest.image))
    .pipe(browserSync.reload({ stream: true }));
}
exports.image = image;


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
  gulp.watch(src.htmlWatch, pug);
  gulp.watch(src.cssWatch, sass);
  gulp.watch(src.jsWatch, js);
  gulp.watch(src.imageWatch, image);
}
exports.watch = watch;


// デフォルトタスク
exports.default = gulp.series(
  gulp.parallel(pug, sass, js, image),
  gulp.parallel(serve, watch),
);
