/**
 * 手记管理API
 */

'use strict';

var express = require('express');
var controller = require('./notes.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/add', controller.add);
router.post('/update', controller.update);
router.post('/offline', controller.offline);
router.post('/get', controller.get);
router.post('/del', controller.del);

module.exports = router;
