/**
 * Created by hxl on 2015/12/22.
 */
'use strict'
var express     = require('express');
var router      = express.Router();
var controller  = require('./col_activity.controller');

router.post('/list',controller.list);
router.post('/get',controller.get);
router.post('/add',controller.add);
router.post('/update',controller.update);
router.post('/offline',controller.offline);
router.post('/join_list',controller.join_list);
router.post('/join_export',controller.join_export);
module.exports = router;