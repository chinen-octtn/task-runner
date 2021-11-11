// 必要プラグインの読み込み
const gulp = require('gulp')

// Pug
const gulpPug = require('gulp-pug')
const fs = require('fs')

// Sass
const gulpSass = require('gulp-sass')(require('sass'))
const sassGlob = require('gulp-sass-glob-use-forward')
const postcss = require('gulp-postcss')
const postcssSyntax = require('postcss-scss')
const autoprefixer = require('autoprefixer')
const cmq = require('postcss-combine-media-query')
const stylelint = require('stylelint')

// Image
const imagemin = require('gulp-imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')

// Local server
const browserSync = require('browser-sync')
const browserSyncSsi = require('browsersync-ssi')

// webpack
const webpackStream = require('webpack-stream')
const webpack = require('webpack')
const webpackConfig = require('./webpack.config') // webpackの設定ファイルの読み込み
const named = require('vinyl-named')
// Utility
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const changed = require('gulp-changed')

/**
 * 開発用ディレクトリ
 */
const src = {
  data: 'src/_data/site.json',
  pug: {
    dir: 'src/pug/',
    file: 'src/pug/**/!(_)*.pug',
    watch: ['src/pug/**/*.pug', 'src/_data/**/*.json'],
  },
  sass: {
    dir: 'src/scss',
    file: 'src/scss/**/!(_)*.scss',
    watch: 'src/**/*.scss',
  },
  js: {
    file: 'src/js/**/!(_)*.ts',
    watch: 'src/**/*.ts',
  },
  img: {
    file: 'src/img/**/*.{png,jpg,gif,svg,ico}',
    watch: 'src/img/**/*',
  },
}

/**
 * 公開用ディレクトリ
 */
const dest = 'dist/'

// Pug
// .pug -> .html
function pug() {
  // JSONファイルの読み込み。
  const locals = {
    site: JSON.parse(fs.readFileSync(src.data)),
  }
  return gulp
    .src(src.pug.file)
    .pipe(
      plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
    )
    .pipe(
      gulpPug({
        // `locals`に渡したデータを各Pugファイルで取得
        locals,
        // ルート相対パスでincludeが使えるようにする
        basedir: src.pug.dir,
        // Pugファイルの整形。
        pretty: true,
      })
    )
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({ stream: true }))
}
exports.pug = pug

// Sass
// scss -> css
function sass() {
  const lintPlugins = [stylelint()]
  return gulp
    .src(src.sass.file)
    .pipe(
      plumber({ errorHandler: notify.onError('Error: <%= error.message %>') })
    )
    .pipe(
      postcss(lintPlugins, {
        syntax: postcssSyntax,
      })
    )
    .pipe(sassGlob())
    .pipe(
      gulpSass({
        outputStyle: 'expanded', // expanded or compressed
        includePaths: [src.sass.dir],
      }).on('error', gulpSass.logError)
    )
    .pipe(postcss([cmq(), autoprefixer()]))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({ stream: true }))
}
exports.sass = sass

/**
 * JS
 * ES6をWebpackでbundle
 */
function js() {
  return gulp
    .src(src.js.file)
    .pipe(
      named((file) => {
        return file.relative.replace(/\.[^\.]+$/, '')
      })
    )
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({ stream: true }))
}
exports.js = js

/**
 * 画像を圧縮
 */
function image() {
  return gulp
    .src(src.img.file)
    .pipe(changed(dest))
    .pipe(
      plumber({
        errorHandler(err) {
          // eslint-disable-next-line no-console
          console.log(err.messageFormatted)
          this.emit('end')
        },
      })
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
      ])
    )
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({ stream: true }))
}
exports.image = image

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
          baseDir: dest,
          ext: '.html',
        }),
      ],
      baseDir: dest,
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
  })
  done()
}
exports.serve = serve

// 監視
function watch() {
  gulp.watch(src.pug.watch, pug)
  gulp.watch(src.sass.watch, sass)
  gulp.watch(src.js.watch, js)
  gulp.watch(src.img.watch, image)
}
exports.watch = watch

// デフォルトタスク
exports.default = gulp.series(
  gulp.parallel(pug, sass, js, image),
  gulp.parallel(serve, watch)
)
