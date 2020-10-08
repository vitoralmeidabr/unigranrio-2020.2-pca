"use strict";

const browsersync = require("browser-sync").create();
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const sass = require( 'gulp-sass' );

/*
 * Arquivos que devem ser monitorados para ativar o BrowserSync
 */
function watchFiles() {
  gulp.watch("./**/*.css", browserSyncReload);
  gulp.watch("./**/*.html", browserSyncReload);
}

/*
 * BrowserSync
 */
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

/*
 * Resetar vendor
 */
function clean() {
  return del(["./vendor/"]);
}

/*
 * Copiar arquivos/dependencias da pasta node_modules para pasta vendor
 * Referência: https://stackoverflow.com/questions/27464168/how-to-include-scripts-located-inside-the-node-modules-folder
 */
function modules() {
  // Bootstrap
  var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest('./vendor/bootstrap'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
  return merge(bootstrap, jquery);
}

function styles() {
	return gulp
		.src( './assets/css/style.scss', { allowEmpty: true })
		.pipe(
			sass({
				errLogToConsole: true,
				outputStyle: 'expanded',
				precision: 10
			})
		)
		.on( 'error', sass.logError )
		.pipe( gulp.dest( './assets/css/' ) )
		.pipe( browsersync.stream() );
}

/*
 * Definir sequencia de tasks
 */
const vendor = gulp.series(clean, modules, styles);
const build = gulp.series(vendor);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
