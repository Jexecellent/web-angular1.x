/**
 * 分销管理管理API
 */

'use strict';

var express = require('express');
var controller = require('./storeDistribute.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/disapplyList', controller.disapplyList);
router.post('/sellercodeGen', controller.sellercodeGen);
router.post('/dispercentGet', controller.dispercentGet);
router.post('/dispercentAdd', controller.dispercentAdd);
router.post('/audit', controller.audit);
router.post('/commissionList', controller.commissionList);
router.post('/commissionGet', controller.commissionGet);
router.post('/payoffList', controller.payoffList);
router.post('/bonusList', controller.bonusList);
router.post('/bonusGet', controller.bonusGet);
router.post('/commissionPayoff', controller.commissionPayoff);
router.post('/bonusPayoff', controller.bonusPayoff);
router.post('/excel', controller.excel);

module.exports = router;