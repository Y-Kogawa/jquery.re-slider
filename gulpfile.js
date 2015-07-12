var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var del = require('del');

var setting = {
  autoprefixer: {
      browser: ['last 2 version', 'Explorer >= 8', 'Android >= 4', 'Android 2.3']
  },
  browserSync: {
    // 使わない方はコメントアウトする
    // proxy: 'environment.yk',
    server:{
        baseDir: 'www',
    },
  },
  // css、jsのミニファイの有効化/無効化
  minify: {
    css: false,
    js: false
  },
  cssbeautify: {
    disabled: false,
    options: {
      indent: '	'
    }
  },
  csscomb: {
    disabled: false,
  },
  path: {
    base: {
      src: 'src',
      dest: 'httpdocs'
    },
    sass: {
      src: ['www/**/*.scss', '!www/asset/**/*', '!www/unorganized/**/*'],
      dest: 'www/',
    },
    css_beautify: {
      src: ['www/**/*.css', '!www/asset/**/*.css', '!www/unorganized/**/*.css'],
      dest: 'www/',
    },
    js: {
      src: ['www/assets/js/**/*.js', '!www/asset/**/*', '!www/unorganized/**/*'],
      dest: 'www/assets/js/',
    },
  }
};

// SASS
gulp.task('scss',function(){
  return gulp.src(setting.path.sass.src)
    .pipe($.plumber({
      errorHandler: $.notify.onError("Error: <%= error.message %>") //<-
    }))
    .pipe($.sass())
    .pipe($.autoprefixer(setting.autoprefixer.browser))
    .pipe(gulp.dest(setting.path.sass.dest))
    .pipe(browserSync.reload({stream: true}));
});

// JS Minify
gulp.task('jsminify', function(){
  if(setting.minify.js){
    return gulp.src(setting.path.js.dest+'**/*.js')
      .pipe($.uglify())
      .pipe(gulp.dest(setting.path.js.dest));
  }
});

// CSS Minify
gulp.task('cssminify', function(){
  if(setting.minify.css){
    return gulp.src(setting.path.sass.dest+'**/*.css')
      .pipe($.csso())
      .pipe(gulp.dest(setting.path.sass.dest));
  }
});

// CSS Beautify
gulp.task('cssbeautify', function(){
  if(!setting.cssbeautify.disabled && !setting.minify.css){
    return gulp.src(setting.path.css_beautify.src)
      .pipe($.cssbeautify(setting.cssbeautify.options))
      .pipe(gulp.dest(setting.path.css_beautify.dest));
  }
});

// CSS Comb
gulp.task('csscomb', function(){
  if(!setting.csscomb.disabled && !setting.minify.css){
    return gulp.src(setting.path.sass.dest+'**/*.css')
      .pipe($.csscomb())
      .pipe(gulp.dest(setting.path.sass.dest));
  }
});

// Clean
gulp.task('clean', del.bind(null, setting.path.base.dest));

// Build
gulp.task('build', function(){
  return runSequence(
    ['scss'],
    ['cssbeautify']
  );
});

// Watch
gulp.task('watch', function(){
  browserSync.init(setting.browserSync);

  gulp.watch([setting.path.sass.src], ['scss']);
  gulp.watch('www/**/*', browserSync.reload);
});

gulp.task('default',['watch']);
