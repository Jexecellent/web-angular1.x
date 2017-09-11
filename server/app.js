/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var path = require('path');
var config = require('./config/environment');
// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);
require('pomelo-logger').configure(path.join(config.root, 'server', 'config', 'log4js.json'));

app.set('errorHandler',function(err, msg, resp, session, next){
  console.log("Uncatch exception:%s", err.message);
  if (next) {
    next(null, {code: 500, err: err.message});
  }
});

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
//exports = module.exports = app;
module.exports = app;
