/**
 * Created by Administrator on 2016/1/7.
 */
'use strict'
var express     = require('express');
var router      = express.Router();
var controller  = require('./log.controller');

router.post('/list',controller.list);
router.post('/export', controller.export)
module.exports = router;