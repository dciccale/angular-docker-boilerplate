'use strict';

// Production specific configuration
// =================================
module.exports = {

  // Server port
  port: process.env.PORT || 8080,

  // API
  api: {
    uri: process.env.API_1_PORT_8888_TCP || 'http://localhost:8888'
  }
};
