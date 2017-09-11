/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');
var ueditor = require('./components/ueditor-nodejs/ueditor');
var exportExcel = require('./components/excel/exportExcel');

module.exports = function(app) {

  app.enable('trust proxy');

  // Insert routes below
  app.use('/api/base', require('./api/base'));
  app.use('/api/activity', require('./api/activity'));
  app.use('/api/appuser',require('./api/appuser'));
  app.use('/api/groupmsg', require('./api/groupmsg'));
  app.use('/api/user', require('./api/user'));
  app.use('/api/article', require('./api/article'));
  app.use('/api/mate',require('./api/mate'));
  app.use('/api/notes',require('./api/notes'));
  app.use('/api/module',require('./api/module'));
  app.use('/api/banner', require('./api/banner'));
  app.use('/api/audit', require('./api/audit'));
  app.use('/api/department', require('./api/department'));
  app.use('/api/college', require('./api/colleges'));
  
  /*二期电商平台 begin */
  
  app.use('/api/goods', require('./api/goods'));
  app.use('/api/distribute', require('./api/storeDistribute'));
  app.use('/api/order', require('./api/order'));
  app.use('/api/pageshow', require('./api/pageshow'));
  app.use('/api/log', require('./api/log'));

  //ueditor
  app.use('/api/ueditor/ue', ueditor({//这里的/ueditor/ue是因为文件件重命名为了ueditor,如果没改名，那么应该是/ueditor版本号/ue
    configFile: '/assets/json/ueditor-config.json',//如果下载的是jsp的，就填写/ueditor/jsp/config.json
    mode: 'varicom', //本地存储填写local
    staticPath: path.join(__dirname, 'file_upload'), //一般固定的写法，静态资源的目录，如果是bcs，可以不填
    dynamicPath: '',
    uploadRestAPI: 'http://openrest.varicom.im/api/upload'
  }));

  //exportExcel
  exportExcel.setTmpPath(path.join(__dirname, 'excel_export'));

  //app.get('/attachment/:id',function(req,res,next){
  //  //..db get file realpath
  //  res.download(realpath,filename);
  //});

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets|file_upload)/*')
   .get(errors[404]);

  app.use('/404', errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
