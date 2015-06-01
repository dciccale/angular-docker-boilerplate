'use strict';

var gulp = require('gulp');
var g = require('gulp-load-plugins')({lazy: false});
var noop = g.util.noop;
var es = require('event-stream');
var wiredep = require('wiredep').stream;
var mainBowerFiles = require('main-bower-files');
var rimraf = require('rimraf');
var Queue = require('streamqueue');
var lazypipe = require('lazypipe');
var bower = require('./bower');
var isWatching = false;
var path = require('path');
var karma = require('karma').server;
var colors = g.util.colors;
var open = require('open');

var htmlminOpts = {
  removeComments: true,
  collapseWhitespace: true,
  removeEmptyAttributes: false,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true
};

var karmaConfPath = path.join(__dirname, '/karma.conf.js');

// Dev tasks
// ----------

// Run all tests
gulp.task('test', ['test-client', 'test-server'], function (done) {
  done();
});

// Run client tests
gulp.task('test-client', function (done) {
  karma.start({
    configFile: karmaConfPath,
    singleRun: true
  }, done);
});

// Run server tests
gulp.task('test-server', function () {
  return gulp.src(['./test/server/**/*.js'])
    .pipe(g.spawnMocha({
      env: {NODE_ENV: 'test'},
      istanbul: {
        dir: './coverage/server'
      }
    }));
});

// Watch for file changes and re-run client tests on each change
gulp.task('test-watch', function (done) {
  karma.start({
    configFile: karmaConfPath
  }, done);
});

// ESLint
gulp.task('eslint', function () {
  return lint().pipe(g.eslint.format()).pipe(livereload());
});

// Clean tmp
gulp.task('clean', function (done) {
  rimraf('./.tmp/*', done);
});

// Inject and compile SASS
gulp.task('styles', function () {
  return gulp.src(['./client/app/app.scss'])
    .pipe(g.inject(gulp.src(['./client/{app,components}/**/*.scss', '!./client/app/app.scss'], {read: false}), {
      transform: function (filePath) { return '@import \'' + filePath + '\';'; },
      ignorePath: '/client/app',
      relative: true,
      starttag: '// injector',
      endtag: '// endinjector'
    }))
    .pipe(gulp.dest('./client/app'))
    .pipe(g.sass({
      includePaths: [
        './client/bower_components',
        './client/app',
        './client/components'
      ]
    }).on('error', handleError))
    .pipe(g.autoprefixer())
    .pipe(gulp.dest('./.tmp/app'))
    .pipe(g.cached('built-css'))
    .pipe(livereload());
});

// Templates
gulp.task('templates', function () {
  return templateFiles().pipe(buildTemplates());
});

// Vendors
gulp.task('vendors', function () {
  var files = mainBowerFiles();
  var vendorJs = fileTypeFilter(files, 'js');
  var vendorCss = fileTypeFilter(files, 'css');
  var q = new Queue({objectMode: true});
  if (vendorJs.length) {
    q.queue(gulp.src(vendorJs).pipe(dist('js', 'vendor')));
  }
  if (vendorCss.length) {
    q.queue(gulp.src(vendorCss).pipe(dist('css', 'vendor')));
  }
  return q.done();
});

// Index
gulp.task('index', index);

// Build
gulp.task('build', ['styles', 'templates'], index);

// Serve
gulp.task('serve', ['clean', 'build'], function () {
  var server, skipIndex;

  isWatching = true;

  server = g.liveServer(['./server/app.js'], {}, false);

  // Start server
  server.start().then(function () {
    open('http://localhost:9000');
  });

  // Start livereload server
  g.livereload.listen();

  // Watch server
  gulp.watch(['server/**/*.js'], server.start)
    .on('change', function (evt) {
      g.util.log(
        colors.magenta('gulp-watch'),
        colors.cyan(evt.path.match(/server.*/)[0]),
        'was', evt.type + ', restarting server...'
      );
      setTimeout(g.livereload.reload, 1000);
    });

  skipIndex = false;

  // Watch index change
  gulp.watch(['./client/index.html', './bower.json'], function () {
    gulp.start(skipIndex ? [] : ['index']);
  });

  // Lint all js files
  gulp.watch(['./client/{app,components}/**/*.js', './test/unit/**/*.js'], ['eslint']);

  // Watch scripts
  g.watch(['./client/{app,components}/**/*.js', './test/unit/**/*.js'], function (vinyl) {
    if (vinyl.event !== 'change') {
      skipIndex = true;
      gulp.start('index', function () {
        // server.notify(vinyl);
        g.livereload.changed(vinyl);
        skipIndex = false;
      });
    } else {
      g.livereload.changed(vinyl);
      skipIndex = false;
      // server.notify(vinyl);
    }
  });

  // Lint gulpfile
  gulp.watch('gulpfile.js', function () {
    return lint().pipe(g.eslint.format());
  });

  // Watch client tests
  gulp.watch(['test/client/{app,components}/**/*.js'], ['test-client']);

  // Watch server tests
  gulp.watch(['test/server/**/*.js'], ['test-server']);

  // Watch templates
  g.watch(['./client/{app,components}/**/*.html', '!./client/index.html'], function () {
    gulp.start('templates');
  });

  // Watch sass
  g.watch(['./client/{app,components}/**/*.scss'], function (vinyl) {
    gulp.start('styles');
    g.util.log(
      colors.magenta('gulp-watch'),
      colors.cyan(vinyl.path.match(/client.*/)[0]), vinyl.event + ', compiling...');
  });
});

// Dist tasks
// ----------

// Inject styles and scripts
gulp.task('inject-dist', ['vendors', 'styles-dist', 'scripts-dist'], function () {
  return gulp.src('./client/index.html')
    .pipe(g.inject(gulp.src('./.tmp/app.min.{js,css}'), {
      ignorePath: '.tmp'
    }))
    .pipe(g.inject(gulp.src('./.tmp/vendor.min.{js,css}'), {
      ignorePath: '.tmp',
      starttag: '<!-- inject:vendor:{{ext}} -->'
    }))
    .pipe(gulp.dest('./dist/public'));
});

// Replace index styles script tags with revved files
gulp.task('rev', ['inject-dist'], function () {
  return gulp.src(['./.tmp/**/*.json', './dist/public/index.html'])
    .pipe(g.revCollector({replaceReved: true}))
    .pipe(gulp.dest('./dist/public'));
});

// Run dist tasks for styles
gulp.task('styles-dist', ['styles'], function () {
  return cssFiles().pipe(dist('css', 'app'));
});

// Run dist tasks for scripts
gulp.task('scripts-dist', ['templates-dist'], function () {
  return appFiles().pipe(dist('js', 'app', {ngAnnotate: true}));
});

// Compile and minify templates
gulp.task('templates-dist', function () {
  return templateFiles({min: true}).pipe(buildTemplates());
});

// Clean tmp
gulp.task('clean-dist', function (done) {
  rimraf('./dist/*', done);
});

// Copy server to dist
gulp.task('copy-server', function () {
  return gulp.src('./server/**/*')
    .pipe(gulp.dest('./dist/server'));
});

// Copy favicon.ico to dist
gulp.task('copy-favicon', function () {
  return gulp.src('./client/favicon.ico')
    .pipe(gulp.dest('./dist/public'));
});

// Copy needed bower components
// i.e. font-awesome fonts
gulp.task('copy-assets', function () {
  return gulp.src('./client/bower_components/**/*')
    .pipe(gulp.dest('./dist/public/bower_components'));
});

// Build dist

// Compress images
gulp.task('imagemin', function () {
  return gulp.src('./client/assets/images/{,*//*}*.{png,jpg,gif,svg}')
    .pipe(g.imagemin())
    .pipe(gulp.dest('./dist/public/assets/images'));
});

gulp.task('dist', ['imagemin', 'rev', 'copy-server', 'copy-assets', 'copy-favicon'], function () {
  return gulp.src('./dist/public/index.html')
    .pipe(g.htmlmin(htmlminOpts))
    .pipe(gulp.dest('./dist/public'));
});

// Serve dist directory with gzip/deflateRun dist
gulp.task('serve-dist', function () {
  process.env.NODE_ENV = 'production';
  g.liveServer(['./dist/server/app.js'], {}, false).start();
});

// Default task
gulp.task('default', ['eslint', 'build']);

// Build index
function index() {
  var opt = {read: false};
  return gulp.src('./client/index.html')
    .pipe(wiredep({
      exclude: [/font-awesome.css/, /open-sans.css/, /feather.css/]
    }))
    .pipe(g.inject(es.merge(appFiles(opt), cssFiles(opt)), {
      ignorePath: ['../.tmp'],
      relative: true
    }))
    .pipe(gulp.dest('./client'))
    .pipe(livereload());
}

// All CSS files as a stream
function cssFiles(opt) {
  return gulp.src('./.tmp/app/app.css', opt);
}

// All AngularJS application files as a stream
function appFiles(opt) {
  return gulp.src(['./client/{app,components}/**/*.js', './.tmp/templates.js'], opt);
}

// All AngularJS templates/partials as a stream
function templateFiles(opt) {
  return gulp.src(['./client/{app,components}/**/*.html'], opt)
    .pipe(opt && opt.min ? g.htmlmin(htmlminOpts) : noop());
}

// Build AngularJS templates/partials
function buildTemplates() {
  return lazypipe()
    .pipe(g.ngHtml2js, {moduleName: bower.name})
    .pipe(g.concat, 'templates.js')
    .pipe(gulp.dest, './.tmp')
    .pipe(livereload)();
}

/**
 * Filter an array of files according to file type
 *
 * @param {Array} files
 * @param {String} extension
 * @return {Array}
 */
function fileTypeFilter(files, extension) {
  var regExp = new RegExp('\\.' + extension + '$');
  return files.filter(regExp.test.bind(regExp));
}

/**
 * Concat, rename, minify, rev
 *
 * @param {String} ext
 * @param {String} name
 * @param {Object} opt
 */
function dist(ext, name, opt) {
  opt = opt || {};
  return lazypipe()
    .pipe(g.concat, name + '.' + ext)
    .pipe(gulp.dest, './.tmp')
    .pipe(opt.ngAnnotate ? g.ngAnnotate : noop)
    .pipe(opt.ngAnnotate ? g.rename : noop, name + '.annotated.' + ext)
    .pipe(opt.ngAnnotate ? gulp.dest : noop, './dist')
    .pipe(ext === 'js' ? g.uglify : g.minifyCss)
    .pipe(g.rename, name + '.min.' + ext)
    .pipe(gulp.dest, './.tmp')
    .pipe(g.rev)
    .pipe(gulp.dest, './dist/public')
    .pipe(g.rev.manifest)
    .pipe(gulp.dest, './.tmp/rev-' + name + '-' + ext)();
}

// Livereload (or noop if not run by watch)
function livereload() {
  return lazypipe()
    .pipe(isWatching ? g.livereload : noop)();
}

function lint() {
  return gulp.src(['./gulpfile.js', './client/{app,components}/**/*.js', './test/unit/**/*.js'])
    .pipe(g.cached('eslint'))
    .pipe(g.eslint());
}

function handleError(err) {
  g.util.log(err);
  this.emit('end');
}
