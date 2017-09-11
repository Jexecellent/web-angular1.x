/**
 * 操作员管理API
 */

'use strict';

var express = require('express');
var controller = require('./user.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/addAdmin', controller.addAdmin);
router.post('/updateAdmin', controller.updateAdmin);
router.post('/deleteAdmin', controller.delAdmin);
router.post('/getAdmin', controller.getAdmin);
router.post('/update', controller.update);  //修改app用户
router.post('/get', controller.get);  //app用户
router.post('/roleList', controller.roleList);

module.exports = router;
