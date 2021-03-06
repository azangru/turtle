import gulp from 'gulp';

import browserify from 'browserify';
import babelify from 'babelify';
import ejsify from 'ejsify';
import brfs from 'brfs';
import packageify from 'packageify';
import watchify from 'watchify';
import notify from 'gulp-notify';
import browserSync from 'browser-sync';

import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

import rename from 'gulp-rename';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';

/* nicer browserify errors */
import gutil from 'gulp-util';
import chalk from 'chalk';

let mapError = (err) => {
  if (err.fileName) {
    // regular error
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.fileName.replace(__dirname + '/src/js/', ''))
      + ': '
      + 'Line '
      + chalk.magenta(err.lineNumber)
      + ' & '
      + 'Column '
      + chalk.magenta(err.columnNumber || err.column)
      + ': '
      + chalk.blue(err.description));
  } else {
    // browserify error..
    gutil.log(chalk.red(err.name)
      + ': '
      + chalk.yellow(err.message));
  }

  this.end();
};
/* */


gulp.task('browserify', () => {
  process.env.BABEL_ENV = 'production';

  return browserify({
    entries: [global.paths.jsEntry],
    transform: [babelify, ejsify, brfs, packageify],
    debug: true
  })
    .bundle()
    .on('error', mapError.bind(this))
    .pipe(source(global.paths.jsEntry))
    .pipe(buffer())
    .pipe(rename('app.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(global.paths.public));
});

gulp.task('watchify', () => {
  process.env.BABEL_ENV = 'production';

  let watcher  = watchify(browserify({
    entries: [global.paths.jsEntry],
    transform: [babelify, ejsify, brfs, packageify],
    debug: true,
    cache: {}, packageCache: {}, fullPaths: true
  }));

  let bundle = () => {
    return watcher.bundle()
      .on('error', mapError.bind(this))
      .pipe(source(global.paths.jsEntry))
      .pipe(buffer())
      .pipe(rename('app.min.js'))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(global.paths.public))
      .pipe(notify('Watchify has finished rebuilding script bundle'))
      .pipe(browserSync.reload({ stream: true }));
  };

  watcher.on('update', bundle);

  return bundle();
});

gulp.task('frontend:build:js', ['browserify']);
