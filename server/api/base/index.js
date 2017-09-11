/**
 * Created by hxl on 2015/10/16.
 */
'use strict';

var express     = require('express');
var router      = express.Router();
var controller  = require('./base.controller');

router.post('/login', controller.login);
router.post('/baseinfo', controller.baseinfo);
router.post('/logout', controller.logout);
router.post('/validate', controller.validate);
router.post('/menus', controller.menus);
router.post('/config', controller.config);
router.post('/modules', controller.modules);
router.post('/fileupload', controller.fileUpload);
router.post('/sort', controller.sort);
router.post('/appinfo', controller.appinfo);
router.post('/appupdate', controller.appupdate);
router.post('/statTips', controller.statTips);
router.post('/customization/update', controller.statTips);
router.post('/statisticsApp', controller.statisticsApp);
router.post('/jumpprotocol', controller.jumpprotocol);

module.exports = router;