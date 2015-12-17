/*
 * API Proxy
 */

'use strict';

var httpProxy = require('http-proxy');

module.exports = function (app, config) {
  var apiProxy = httpProxy.createProxyServer();

  apiProxy.on('error', function (err, req, res) {
    console.log('>> Not connected to the API');
    res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end(err.message);
  });

  app.all('/api/*', function (req, res) {
    req.url = req.url.replace(/\/api/, '');
    apiProxy.web(req, res, {target: config.api.uri});
  });
};
