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
        baseDir: 'build',
    },
  },
  imagemin: {
    disabled: true,  // falseでimageminを実行
    level: 7  // 圧縮率
  },
  // css、jsのミニファイの有効化/無効化
  minify: {
    css: false,
    js: false
  },
  cssbeautify: {
    disabled: true,
    options: {
      indent: '	'
    }
  },
  csscomb: {
    disabled: true,
  },
  path: {
    base: {
      src: 'src',
      dest: 'build'
    },
    sass: {
      src: 'src/assets/sass/**/*.scss',
      dest: 'build/assets/css/',
    },
    js: {
      src: 'src/assets/js/**/*.js',
      dest: 'build/assets/js/',
    },
    image: {
      src: 'src/assets/img/**/*',
      dest: 'build/assets/img/',
    },
    lib: {
      src: 'src/assets/lib/**/*',
      dest: 'build/assets/lib/',
    },
    include: {
      src: ['src/assets/include/**/*', '!src/assets/include/**/_*.ejs'],
      dest: 'build/assets/include/',
    },
    etc: {
      src: 'src/assets/etc/**/*',
      dest: 'build/assets/etc/',
    },
    ejs: {
      watch: 'src/**/*.ejs',
      src: ['src/**/*.ejs', '!src/**/_*.ejs']
    },
    html: {
      src: ['src/**/*', '!src/assets/**/*', '!src/**/*.ejs']
    },
  }
};

// 画像の圧縮
gulp.task('imagemin', function(){
  if(!setting.imagemin.disabled){
    var imageminOptions = {
      optimizationLevel: setting.imagemin.lebel
    };

    return gulp.src(setting.path.image.src)
      .pipe($.changed(setting.path.image.dest))
      .pipe($.imagemin(imageminOptions))
      .pipe(gulp.dest(setting.path.image.dest))
      .pipe(browserSync.reload({stream: true}));
  }else{
    return gulp.src(
        setting.path.image.src
      )
      .pipe($.changed(setting.path.image.dest))
      .pipe(gulp.dest(setting.path.image.dest))
      .pipe(browserSync.reload({stream: true}));
  }
});

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

// EJS
gulp.task('ejs', function(){
  return gulp.src(
    setting.path.ejs.src
  )
  .pipe($.ejs())
  .pipe(gulp.dest(setting.path.base.dest))
  .pipe(browserSync.reload({stream: true}));
});

// HTML
gulp.task('html', function(){
  return gulp.src(
    setting.path.html.src,
    {base: setting.path.base.src}
  )
  .pipe($.changed(setting.path.base.dest))
  .pipe(gulp.dest(setting.path.base.dest))
  .pipe(browserSync.reload({stream: true}));
});

// JavaScript
gulp.task('js', function(){
  return gulp.src(
    setting.path.js.src
  )
  .pipe($.changed(setting.path.js.dest))
  .pipe(gulp.dest(setting.path.js.dest))
  .pipe(browserSync.reload({stream: true}));
});

// Lib
gulp.task('lib', function(){
  return gulp.src(
    setting.path.lib.src
  )
  .pipe($.changed(setting.path.lib.dest))
  .pipe(gulp.dest(setting.path.lib.dest))
  .pipe(browserSync.reload({stream: true}));
});

// Include
gulp.task('include', function(){
  return gulp.src(
    setting.path.include.src
  )
  .pipe($.changed(setting.path.include.dest))
  .pipe(gulp.dest(setting.path.include.dest))
  .pipe(browserSync.reload({stream: true}));
});

// Etc
gulp.task('etc', function(){
  return gulp.src(
    setting.path.etc.src
  )
  .pipe($.changed(setting.path.etc.dest))
  .pipe(gulp.dest(setting.path.etc.dest))
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
    return gulp.src(setting.path.sass.dest+'**/*.css')
      .pipe($.cssbeautify(setting.cssbeautify.options))
      .pipe(gulp.dest(setting.path.sass.dest));
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
    ['clean'],
    ['html', 'ejs', 'js', 'scss', 'lib', 'include', 'etc'],
    ['csscomb'],
    ['imagemin', 'cssminify', 'jsminify', 'cssbeautify']
  );
});

// Watch
gulp.task('watch', function(){
  browserSync.init(setting.browserSync);

  gulp.watch([setting.path.sass.src], ['scss']);
  gulp.watch([setting.path.ejs.watch], ['ejs']);
  gulp.watch([setting.path.js.src], ['js']);
  gulp.watch([setting.path.lib.src], ['lib']);
  gulp.watch([setting.path.include.src], ['include']);
  gulp.watch([setting.path.etc.src], ['etc']);
  gulp.watch([setting.path.html.src], ['html']);
  gulp.watch([setting.path.image.src], ['imagemin']);
});

gulp.task('default',['watch']);
