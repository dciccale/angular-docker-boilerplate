'use strict';

var gulp = require('gulp');
var g = require('gulp-load-plugins')({lazy: false});
var noop = g.util.noop;
var es = require('event-stream');
var mainBowerFiles = require('main-bower-files');
var rimraf = require('rimraf');
var Queue = require('streamqueue');
var lazypipe = require('lazypipe');
var bower = require('./bower');
var isWatching = false;
var path = require('path');
var compression = require('compression');
var historyApiFallback = require('connect-history-api-fallback');
var karma = require('karma').server;

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
    .pipe(g.spawnMocha());
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

// Compile styles
gulp.task('styles', function () {
  return gulp.src(['./client/app/app.scss'])
    .pipe(injectSass())
    .pipe(g.sass().on('error', handleError))
    .pipe(g.autoprefixer())
    .pipe(gulp.dest('./.tmp/app'))
    .pipe(g.cached('built-css'))
    .pipe(livereload());
});

// CSSLint
gulp.task('csslint', ['styles'], function () {
  return cssFiles()
    .pipe(g.cached('csslint'))
    .pipe(g.csslint('./.csslintrc'))
    .pipe(g.csslint.reporter());
});

// Lint everything
gulp.task('lint', ['eslint', 'csslint']);

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
  isWatching = true;

  var server = g.liveServer(['./server/app.js'], {}, false);
  server.start();

  //restart my server
  gulp.watch('./server/app.js', server.start);

  // Initiate livereload server:
  g.livereload.listen();

  var skipIndex = false;

  // Watch index change
  gulp.watch(['./client/index.html', './bower.json'], function () {
    gulp.start(skipIndex ? [] : ['index']);
  });

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
  gulp.watch(['./client/{app,components}/**/*.scss'], ['csslint'])
    .on('change', function (evt) {
      g.util.log(
        g.util.colors.magenta('gulp-watch'),
        g.util.colors.cyan(evt.path.match(/client.*/)[0]),
        'was', evt.type + ', compiling...'
      );
    });
});

// Dist tasks
// ----------

// Compress images
gulp.task('imagemin', function () {
  return gulp.src('./client/assets/images/{,*//*}*.{png,jpg,gif,svg}')
    .pipe(g.imagemin())
    .pipe(gulp.dest('./dist/assets'));
});

// Inject styles and scripts
gulp.task('inject-dist', ['vendors', 'styles-dist', 'scripts-dist'], function () {
  return gulp.src('./client/index.html')
    .pipe(g.inject(gulp.src('./.tmp/vendor.min.{js,css}'), {
      ignorePath: '.tmp',
      starttag: '<!-- inject:vendor:{{ext}} -->'
    }))
    .pipe(g.inject(gulp.src('./.tmp/app.min.{js,css}'), {
      ignorePath: '.tmp'
    }))
    .pipe(gulp.dest('./dist'));
});

// Version styles and scripts
gulp.task('rev', ['inject-dist'], function () {
  return gulp.src(['./.tmp/**/*.json', './dist/index.html'])
    .pipe(g.revCollector({replaceReved: true}))
    .pipe(gulp.dest('./dist'));
});

// Run dist tasks for styles
gulp.task('styles-dist', ['styles'], function () {
  return cssFiles().pipe(dist('css', 'app'));
});

// Run dist tasks for scripts
gulp.task('scripts-dist', ['templates-dist'], function () {
  return appFiles().pipe(dist('js', 'app', {ngAnnotate: false}));
});

// Compile and minify templates
gulp.task('templates-dist', function () {
  return templateFiles({min: true}).pipe(buildTemplates());
});

// Build dist
gulp.task('dist', ['imagemin', 'rev'], function () {
  return gulp.src('./dist/index.html')
    .pipe(g.htmlmin(htmlminOpts))
    .pipe(gulp.dest('./dist'));
});

// Serve dist directory with gzip/deflateRun dist
gulp.task('serve-dist', g.serve({
  port: 3001,
  root: ['./dist'],
  middlewares: [compression(), historyApiFallback]
}));

// Default task
gulp.task('default', ['lint', 'build-all']);

// Build index
function index() {
  var opt = {read: false};
  return gulp.src('./client/index.html')
    .pipe(g.inject(gulp.src(mainBowerFiles(), opt), {
      starttag: '<!-- inject:vendor:{{ext}} -->',
      relative: true
    }))
    .pipe(g.inject(es.merge(appFiles(opt), cssFiles(opt)), {
      ignorePath: ['../.tmp'],
      relative: true
    }))
    .pipe(gulp.dest('./client'))
    .pipe(livereload());
}

function injectSass() {
  return g.inject(gulp.src(['./client/{app,components}/**/*.scss', '!./client/app/app.scss'], {read: false}), {
    transform: function (filePath) { return '@import \'' + filePath + '\';'; },
    ignorePath: '/client/app',
    relative: true,
    starttag: '// injector',
    endtag: '// endinjector'
  })
  .pipe(gulp.dest('./client/app'));
}

// All CSS files as a stream
function cssFiles(opt) {
  return gulp.src('./.tmp/css/**/*.css', opt);
}

// All AngularJS application files as a stream
function appFiles(opt) {
  return gulp.src(['./client/{app,components}/**/*.js', './.tmp/templates.js'], opt);
    // .pipe(g.angularFilesort());
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
    .pipe(gulp.dest, './dist')
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
