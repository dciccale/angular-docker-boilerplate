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

// Run tests
gulp.task('test', function (done) {
  karma.start({
    configFile: karmaConfPath,
    singleRun: true
  }, done);
});

// Watch for file changes and re-run tests on each change
gulp.task('test-watch', function (done) {
  karma.start({
    configFile: karmaConfPath
  }, done);
});

// ESLint
gulp.task('eslint', function () {
  return lint()
    .pipe(g.eslint.format())
    .pipe(livereload());
});

// Clean CSS tmp
gulp.task('clean-css', function (done) {
  rimraf('./.tmp/css', done);
});

// Compile sass and run auto prefixer
gulp.task('styles', ['clean-css'], function () {
  return gulp.src(['./src/sass/*.scss', '!./src/sass/_*.scss'])
    .pipe(g.sass().on('error', handleError))
    .pipe(g.autoprefixer())
    .pipe(gulp.dest('./.tmp/css/'))
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
    q.queue(gulp.src(vendorJs).pipe(dist('js', 'vendors')));
  }
  if (vendorCss.length) {
    q.queue(gulp.src(vendorCss).pipe(dist('css', 'vendors')));
  }
  return q.done();
});

// Index
gulp.task('index', index);

gulp.task('build-all', ['styles', 'templates'], index);

// Static file server
gulp.task('statics', g.serve({
  port: 3000,
  root: ['./.tmp', './.tmp/src/app', './src/app', './bower_components'],
  middleware: historyApiFallback
}));

// Watch
gulp.task('serve', ['watch']);
gulp.task('watch', ['build-all', 'statics'], function () {
  isWatching = true;
  // Initiate livereload server:
  g.livereload.listen();
  gulp.watch(['./src/app/**/*.js', './test/unit/**/*.js'], ['eslint']).on('change', function (evt) {
    if (evt.type !== 'changed') {
      gulp.start('index');
    } else {
      g.livereload.changed(evt);
    }
  });
  gulp.watch('gulpfile.js', function () {
    return lint().pipe(g.eslint.format());
  });
  gulp.watch('./src/app/index.html', ['index']);
  gulp.watch(['./src/app/**/*.html', '!./src/app/index.html'], ['templates']);
  gulp.watch(['./src/sass/**/*.scss'], ['csslint'])
    .on('change', function (evt) {
      g.util.log(
        g.util.colors.magenta('gulp-watch'),
        g.util.colors.cyan(evt.path.replace(/.*(?=sass)/, '')),
        'was', evt.type + ', compiling...'
      );
    });
});

/**
 * Dist tasks
 */

// Compress images
gulp.task('imagemin', function () {
  return gulp.src('./src/app/assets/**/*.{png,jpg,gif,svg}')
    .pipe(g.imagemin())
    .pipe(gulp.dest('./dist/assets'));
});

// Inject styles and scripts
gulp.task('inject-dist', ['vendors', 'styles-dist', 'scripts-dist'], function () {
  return gulp.src('./src/app/index.html')
    .pipe(g.inject(gulp.src('./.tmp/vendors.min.{js,css}'), {
      ignorePath: '.tmp',
      starttag: '<!-- inject:vendor:{{ext}} -->'
    }))
    .pipe(g.inject(gulp.src('./.tmp/' + bower.name + '.min.{js,css}'), {ignorePath: '.tmp'}))
    .pipe(gulp.dest('./dist/'));
});

// Version styles and scripts
gulp.task('rev', ['inject-dist'], function () {
  return gulp.src(['./.tmp/**/*.json', './dist/index.html'])
    .pipe(g.revCollector({replaceReved: true}))
    .pipe(gulp.dest('dist'));
});

// Run dist tasks for styles
gulp.task('styles-dist', ['styles'], function () {
  return cssFiles().pipe(dist('css', bower.name));
});

// Run dist tasks for scripts
gulp.task('scripts-dist', ['templates-dist'], function () {
  return appFiles().pipe(dist('js', bower.name, {ngAnnotate: false}));
});

// Compile and minify templates
gulp.task('templates-dist', function () {
  return templateFiles({min: true}).pipe(buildTemplates());
});

// Build dist index
gulp.task('dist', ['imagemin', 'rev'], function () {
  return gulp.src('./dist/index.html')
    .pipe(g.htmlmin(htmlminOpts))
    .pipe(gulp.dest('./dist/'));
});

// Serve dist directory with gzip/deflateRun dist
// TODO: change to nodemon for having a separate server file
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
  return gulp.src('./src/app/index.html')
    .pipe(g.inject(gulp.src(mainBowerFiles(), opt), {
      ignorePath: 'bower_components',
      starttag: '<!-- inject:vendor:{{ext}} -->'
    }))
    .pipe(g.inject(es.merge(appFiles(), cssFiles(opt)), {ignorePath: ['.tmp', 'src/app']}))
    // .pipe(gulp.dest('./src/app/'))
    .pipe(g.embedlr())
    .pipe(gulp.dest('./.tmp/'))
    .pipe(livereload());
}

// All CSS files as a stream
function cssFiles(opt) {
  return gulp.src('./.tmp/css/**/*.css', opt);
}

// All AngularJS application files as a stream
function appFiles() {
  var files = [
    './.tmp/' + bower.name + '-templates.js',
    './.tmp/src/app/**/*.js',
    './src/app/**/*.js'
  ];
  return gulp.src(files)
    .pipe(g.angularFilesort());
}

// All AngularJS templates/partials as a stream
function templateFiles(opt) {
  return gulp.src(['./src/app/**/*.html', '!./src/app/index.html'], opt)
    .pipe(opt && opt.min ? g.htmlmin(htmlminOpts) : noop());
}

// Build AngularJS templates/partials
function buildTemplates() {
  return lazypipe()
    .pipe(g.ngHtml2js, {
      moduleName: bower.name,
      prefix: '/' + bower.name + '/',
      stripPrefix: '/src/app'
    })
    .pipe(g.concat, bower.name + '-templates.js')
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
  return gulp.src(['./gulpfile.js', './src/app/**/*.js', './test/unit/**/*.js'])
    .pipe(g.cached('eslint'))
    .pipe(g.eslint());
}

function handleError(err) {
  g.util.log(err);
  this.emit('end');
}
