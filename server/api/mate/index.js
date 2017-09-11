/**
 * Created by hxl on 2015/10/27.
 */
'use strict'
var express     = require('express');
var router      = express.Router();
var controller  = require('./mate.controller');

router.post('/list', controller.list);
router.post('/add',controller.add);
router.post('/offline', controller.offline);
router.post('/get', controller.get);
module.exports = router;