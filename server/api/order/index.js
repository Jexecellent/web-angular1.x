/**
 * 分销管理管理API
 */

'use strict';

var express = require('express');
var controller = require('./order.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/get', controller.get);
router.post('/logisticscompanyList', controller.logisticscompanyList);
router.post('/transportAdd', controller.transportAdd);
router.post('/refund', controller.refund);
router.post('/receiveUpdate', controller.receiveUpdate);
router.post('/cityList', controller.cityList);
router.post('/cancel', controller.cancel);
router.post('/logisticsGet', controller.logisticsGet);
router.post('/cityAddressList', controller.cityAddressList);

module.exports = router;