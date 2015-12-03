/*jslint node: true */
"use strict";

//dev and test purposes only, no production tasks included here,
//e.g. uglify, minify, compression etc.
var gulp = require('gulp');
var browserify = require('browserify');
var $ = require('gulp-load-plugins')();
var path = require('path');
var fs = require('fs');
var source = require('vinyl-source-stream');
var del = require('del');

gulp.task('default', ['clean'], function() {
  gulp.start('copy', 'styles', 'libcode', 'appcode', 'fonts');
});

var DEV_DEST = 'static';

// read external package list from package.json
var EXTERNAL_LIBS = (function() {
  var pkgPath = path.join(__dirname, 'package.json');
  var pjson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return Object.keys(pjson.dependencies);
})();

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

gulp.task('libcode', function() {
  return browserify({
    entries: ['./noop.js'],
    debug: true,
    require: EXTERNAL_LIBS,
  }).bundle()    
    .on('error', console.error.bind(console))
    .pipe(source('lib.js'))    
    .pipe(gulp.dest(DEV_DEST)); 
});

/**
 * This builds up the application code, knowing that EXTERNAL_LIBS
 * already been built as part of the libcode step.
 */
gulp.task('appcode', function() {
  (function bundleOrNothing() {
    try {
      var b = browserify({
        entries: './app/scripts/main.js',
        debug: true,
        transform: ['reactify'],
        extensions: ['.jsx'],
        detectGlobals: false
      });
      // tell browserify which libs are external
      EXTERNAL_LIBS.forEach(function(lib) {
        b.external(lib);
        return true;
      });
      return b
        .bundle()
        .on('error', function(e) {console.error(e.message);});
    }
    catch (a) {
      return gulp.src(['./noop.js']);
    }
  })()
    // This collects the bundled output and names it so gulp can
    // write it out.    
    .pipe(source('app.js'))    
    .pipe(gulp.dest(DEV_DEST));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  return gulp.src(
      'app/styles/app.less'
    )
    .pipe($.less()
      .on('error', console.error.bind(console))
    )
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest(DEV_DEST))
    .pipe($.size({title: 'styles'}));
});

gulp.task('copy', function () {
  return gulp.src([
    'app/index.html',
  ]).pipe(gulp.dest(DEV_DEST))
    .pipe($.size({title: 'copy'}));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('static/images'))
    .pipe($.size({title: 'images'}));
});

gulp.task('fonts', function () {
  return gulp.src(['node_modules/bootstrap/fonts/**'])
    .pipe(gulp.dest('static/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, [DEV_DEST]));