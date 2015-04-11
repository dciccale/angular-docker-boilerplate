/*
 * API Proxy
 */

'use strict';

var httpProxy = require('http-proxy');

module.exports = function (app, config) {
  var apiProxy = httpProxy.createProxyServer();

  app.all('/api/*', function (req, res) {
    req.url = req.url.replace(/\/api/, '');
    apiProxy.web(req, res, {target: config.api.uri});
  });
};
