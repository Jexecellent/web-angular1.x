/**
 * Created by hxl on 2015/10/16.
 */
'use strict'

var express     = require('express');
var router      = express.Router();
var controller  = require('./activity.controller');

router.post('/getActivityList', controller.getActivityList);
router.post('/add',controller.add);
router.post('/get',controller.get);
router.post('/exportExcel',controller.exportExcel);
router.post('/update',controller.update);
router.post('/offline',controller.offline);

router.post('/join_list', controller.join_list);
router.post('/join_update',controller.join_update);
router.post('/join_export',controller.join_export);

router.post('/union_list',controller.union_list);

router.post('/union_add', controller.union_add);
router.post('/union_cancel',controller.union_cancel);

router.post('/union_enter', controller.union_enter);

module.exports = router;