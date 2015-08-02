module.exports = function () {

  var mainBowerFiles = require('main-bower-files');
  var bowerFiles = mainBowerFiles({filter: /\.js$/});

  var client = 'client/';
  var server = 'server/';
  var test = 'test/';
  var coverage = 'coverage/';

  var clientApp = client + 'app/';
  var clientComponents = client + 'components/';
  var appComponents = '{app,components}/';
  var assets = 'assets/';
  var images = assets + 'images/'

  var bower = {
    file: 'bower.json',
    dir: client + 'bower_components/'
  };

  var paths = {
    bower: bower,
    clientApp: clientApp,
    clientComponents: clientComponents,
    tmp: '.tmp/',
    gulpfile: 'gulpfile.js',
    favicon: client + 'favicon.ico',
    images: images,

    sass: {
      main: clientApp + 'app.scss',
      all: client + appComponents + '**/*.scss'
    },

    client: {
      dir: client,
      scripts: client + appComponents + '**/*.js',
      index: client + 'index.html',
      views: client + appComponents + '**/*.html',
      images: client + images
    },

    server: {
      dir: server,
      all: server + '**/*',
      app: server + 'app.js',
      config: server + 'config/environment'
    },

    test: {
      client: test + client + appComponents + '**/*.js',
      server: test + server + '**/*.js',
      all: test + '**/*.js',
      coverage: {
        server: coverage + server
      }
    },

    dist: {
      dir: 'dist/',
      public: 'dist/public/',
      server: 'dist/server/'
    },

    karma: {
      conf: 'karma.conf.js',
      files: [].concat(
        bowerFiles,
        'node_modules/phantomjs-polyfill/bind-polyfill.js',
        bower.dir + 'angular-mocks/angular-mocks.js',
        clientApp + 'app.module.js',
        clientApp + '**/*.js',
        clientComponents + '**/*.js',
        clientApp + '**/*.html',
        clientComponents + '**/*.html',
        test + client + '**/*.js'
      ),
      exclude: [],
      preprocessors: {},
      coverage: {
        dir: coverage + client,
        reporters: [
          {type: 'html'},
          {type: 'cobertura', file: 'test-coverage.xml'}
        ]
      },
      ngHtml2JsPreprocessor: {
        stripPrefix: client
      }
    }
  };

  paths.karma.preprocessors[client + appComponents + '**/*.js'] = ['coverage'];
  paths.karma.preprocessors[client + appComponents + '**/*.html'] = ['ng-html2js'];

  return paths;
};
