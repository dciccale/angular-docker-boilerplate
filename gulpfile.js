'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({lazy: false});
var noop = $.util.noop;
var es = require('event-stream');
var mainBowerFiles = require('main-bower-files');
var rimraf = require('rimraf');
var lazypipe = require('lazypipe');
var path = require('path');
var karma = require('karma').server;
var colors = $.util.colors;
var browserSync = require('browser-sync');

var bower = require('./bower');
var isWatching = false;

var paths = require('./paths.conf')();
var karmaConfPath = path.join(__dirname, paths.karma.conf);

var htmlminOpts = {
  removeComments: true,
  collapseWhitespace: true,
  removeEmptyAttributes: false,
  collapseBooleanAttributes: true,
  removeRedundantAttributes: true
};


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
  return gulp.src(paths.test.server)
    .pipe($.spawnMocha({
      env: {NODE_ENV: 'test'},
      istanbul: {
        dir: paths.test.coverage.server
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
  return gulp.src([paths.gulpfile, paths.client.scripts, paths.test.all])
    .pipe($.cached('eslint'))
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe(livereload());
});

// Clean tmp
gulp.task('clean', function (done) {
  rimraf(paths.tmp, done);
});

// Inject sass partials and compile main sass file
gulp.task('styles', function () {
  var scssFiles = [paths.sass.all, '!' + paths.sass.main];

  return gulp.src(paths.sass.main)
    .pipe(injectSass())
    .pipe(gulp.dest(paths.clientApp))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      sourcemap: true,
      includePaths: [
        paths.bower.dir,
        paths.clientApp,
        paths.clientComponents
      ]
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer())
    .pipe($.sourcemaps.write())
    .pipe($.cached('built-css'))
    .pipe(gulp.dest(paths.tmp + 'app/'))
    .pipe(livereload());

  function injectSass() {
    return $.inject(gulp.src(scssFiles, {read: false}), {
      transform: transform,
      relative: true,
      starttag: '// {{name}}:scss',
      endtag: '// endinject'
    });
  }

  function transform(filePath) {
    return '@import \'' + filePath + '\';';
  }
});

// Templates
gulp.task('templates', function () {
  return templateFiles().pipe(buildTemplates());
});

// Vendors
gulp.task('vendors-js', function () {
  var js = mainBowerFiles({filter: /\.js$/});
  return gulp.src(js).pipe(dist('js', 'vendor'));
});

gulp.task('vendors-css', function () {
  var css = mainBowerFiles({filter: ['*.css', '!font-awesome.css']});
  return gulp.src(css).pipe(dist('css', 'vendor'));
});

gulp.task('vendors', ['vendors-js', 'vendors-css']);

// Index
gulp.task('index', index);

// Build
gulp.task('build', ['styles', 'templates'], index);

// Serve and watchers
gulp.task('serve', ['clean', 'build'], function () {
  var skipIndex = false;
  var config = require('./' + paths.server.config);

  isWatching = true;

  $.nodemon({
    script: paths.server.app,
    watch: [paths.server.dir]
  })
  .on('restart', function () {
    setTimeout(function () {
      browserSync.reload();
    }, 1000);
  })
  .once('start', function () {
    browserSync({
      proxy: 'localhost:' + config.port,
      port: 3000
    });
  });

  // Watch views
  gulp.watch(paths.client.views).on('change', browserSync.reload);

  // Watch index change
  gulp.watch([paths.client.index, paths.bower.file], function () {
    if (!skipIndex) {
      return gulp.start('index');
    }
    browserSync.reload();
    skipIndex = false;
  });

  // Watch scripts to reload the browser
  $.watch(paths.client.scripts, function (vinyl) {
    // Listen for add/unlink
    if (vinyl.event !== 'change') {
      skipIndex = true;
      gulp.start('index');

    // change event just reload
    } else {
      browserSync.reload();
    }
  });

  // Watch js files for linting
  gulp.watch([paths.gulpfile, paths.client.scripts, paths.test.all], ['eslint']);

  // Watch client tests
  gulp.watch(paths.test.client, ['test-client']);

  // Watch server tests
  gulp.watch(paths.test.server, ['test-server']);

  // Watch templates
  $.watch([paths.client.views], {read: false}, function () {
    gulp.start('templates');
  });

  // Watch sass
  $.watch([paths.sass.all, '!' + paths.sass.main], {read: false}, function (vinyl) {
    gulp.start('styles');
    var clientPath = new RegExp(paths.client.dir + '.*');
    $.util.log(
      colors.magenta('gulp-watch'),
      colors.cyan(vinyl.path.match(clientPath)[0]), vinyl.event + ', compiling...');
  });
});

// Dist tasks
// ----------

// Inject styles and scripts
gulp.task('inject-dist', ['vendors', 'styles-dist', 'scripts-dist'], function () {
  var opt = {read: false};

  return gulp.src(paths.client.index)
    .pipe(injectAppFiles())
    .pipe(injectVendorFiles())
    .pipe(gulp.dest(paths.dist.public));

  function injectAppFiles() {
    return $.inject(gulp.src(paths.tmp + 'app.min.{js,css}', opt), {
      ignorePath: paths.tmp
    });
  }

  function injectVendorFiles() {
    return $.inject(gulp.src(paths.tmp + 'vendor.min.{js,css}', opt), {
      ignorePath: paths.tmp,
      starttag: '<!-- {{name}}:vendor:{{ext}} -->'
    });
  }
});

// Replace index styles script tags with revved files
gulp.task('rev', ['inject-dist'], function () {
  return gulp.src([paths.tmp + '**/*.json', paths.dist.public + 'index.html'])
    .pipe($.revCollector({replaceReved: true}))
    .pipe(gulp.dest(paths.dist.public));
});

// Run dist tasks for scripts
gulp.task('scripts-dist', ['templates-dist'], function () {
  return appFiles().pipe(dist('js', 'app', {ngAnnotate: true}));
});

// Run dist tasks for styles
gulp.task('styles-dist', ['styles'], function () {
  return cssFiles().pipe(dist('css', 'app'));
});

// Compile and minify templates
gulp.task('templates-dist', function () {
  return templateFiles({min: true}).pipe(buildTemplates());
});

// Copy server to dist
gulp.task('copy-server', function () {
  return gulp.src(paths.server.all)
    .pipe(gulp.dest(paths.dist.server));
});

// Copy favicon.ico to dist
gulp.task('copy-favicon', function () {
  return gulp.src(paths.favicon)
    .pipe(gulp.dest(paths.dist.public));
});

// Copy needed bower components
// i.e. font-awesome fonts
gulp.task('copy-assets', function () {
  return gulp.src(paths.bower.dir + '**/*')
    .pipe(gulp.dest(paths.dist.public + 'bower_components'));
});

// Compress images
gulp.task('imagemin', function () {
  return gulp.src(paths.client.images + '{,*//*}*.{png,jpg,gif,svg}')
    .pipe($.cached($.imagemin({
      optimizationLevel: 5,
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(paths.dist.public + paths.images));
});

// Clean dist
gulp.task('clean-dist', function (done) {
  rimraf(paths.dist.dir, done);
});

// Build all files
gulp.task('build-all', ['imagemin', 'rev', 'copy-server', 'copy-assets', 'copy-favicon'], function () {
  return gulp.src(paths.dist.public + 'index.html')
    .pipe($.htmlmin(htmlminOpts))
    .pipe(gulp.dest(paths.dist.public));
});

// Build dist
gulp.task('dist', ['clean-dist'], function () {
  return gulp.start(['build-all']);
});

// Run dist server in production mode
gulp.task('serve-dist', function () {
  $.nodemon({
    script: paths.dist.dir + paths.server.app,
    env: {NODE_ENV: 'production'},
    watch: ['!*.*'],
    quiet: true
  });
});

// Default task
gulp.task('default', ['eslint', 'build']);

// Inject js and css into index
function index() {
  var opt = {read: false};
  var vendors = mainBowerFiles({filter: ['**', '!**/font-awesome.css']});
  return gulp.src(paths.client.index)
    .pipe($.cached('index'))
    .pipe($.inject(gulp.src(vendors, opt), {
      relative: true,
      starttag: '<!-- {{name}}:vendor:{{ext}} -->',
    }))
    .pipe($.inject(es.merge(appFiles(opt), cssFiles(opt)), {
      ignorePath: ['../' + paths.tmp],
      relative: true
    }))
    .pipe(gulp.dest(paths.client.dir))
    .pipe(livereload());
}

// All CSS files as a stream
function cssFiles(opt) {
  return gulp.src(paths.tmp + 'app/app.css', opt);
}

// All AngularJS application files as a stream
function appFiles(opt) {
  return gulp.src([paths.clientApp + '**/*.module.js', paths.client.scripts, paths.tmp + 'templates.js'], opt);
}

// All AngularJS templates/partials as a stream
function templateFiles(opt) {
  return gulp.src(paths.client.views, opt)
    .pipe(opt && opt.min ? $.htmlmin(htmlminOpts) : noop());
}

// Build AngularJS templates/partials
function buildTemplates() {
  return lazypipe()
    .pipe($.cached, 'templates')
    .pipe($.ngHtml2js, {moduleName: bower.name})
    .pipe($.concat, 'templates.js')
    .pipe(gulp.dest, paths.tmp)
    .pipe(livereload)();
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
    .pipe($.concat, name + '.' + ext)
    .pipe(opt.ngAnnotate ? $.ngAnnotate : noop)
    .pipe(opt.ngAnnotate ? $.rename : noop, name + '.annotated.' + ext)
    .pipe(opt.ngAnnotate ? gulp.dest : noop, paths.dist.dir)
    .pipe(ext === 'js' ? $.uglify : $.minifyCss)
    .pipe($.rename, name + '.min.' + ext)
    .pipe(gulp.dest, paths.tmp)
    .pipe($.rev)
    .pipe(gulp.dest, paths.dist.public)
    .pipe($.rev.manifest)
    .pipe(gulp.dest, paths.tmp + 'rev-' + name + '-' + ext)();
}

// Reload browser (or noop if not run by watch)
function livereload() {
  return lazypipe()
    .pipe(isWatching ? browserSync.stream : noop)();
}
