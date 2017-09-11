/**
 * Created by hxl on 2015/10/29.
 */
'use strict';
var express     = require('express');
var router      = express.Router();
var controller  = require('./banner.controller');

router.post('/list', controller.list);
router.post('/add',controller.add);
router.post('/update', controller.update);
router.post('/offline', controller.offline);
router.post('/get', controller.get);
router.post('/del', controller.del);
module.exports = router;