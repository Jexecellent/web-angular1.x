/**
 * 部门管理API
 */

'use strict';

var express = require('express');
var controller = require('./department.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/add', controller.add);
router.post('/get', controller.get);
router.post('/update', controller.update);
router.post('/del', controller.del);

module.exports = router;
