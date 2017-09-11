/**
 * 栏目管理API
 */

'use strict';

var express = require('express');
var controller = require('./module.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/update', controller.update);
router.post('/get_homepage', controller.getHome);
router.post('/update_homepage',controller.updateHome);
/*router.post('/add', controller.add);

router.post('/roleList', controller.roleList);
*/
module.exports = router;
