/**
 * Created by hxl on 2015/11/4.
 */
'use strict'
var express     = require('express');
var router      = express.Router();
var controller  = require('./audit.controller');

router.post('/list', controller.list);
router.post('/add',controller.add);
router.post('/update', controller.update);
router.post('/get', controller.get);
router.post('/del', controller.del);
router.post('/nopass', controller.nopass);
router.post('/save', controller.save);
module.exports = router;