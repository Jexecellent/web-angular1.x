/**
 * Created by hxl on 2015/10/23.
 */
'use strict'
var express     = require('express');
var router      = express.Router();
var controller  = require('./article.controller');

router.post('/list', controller.list);
router.post('/add',controller.add);
router.post('/update', controller.update);
router.post('/get', controller.get);
router.post('/delete', controller.delete);
router.post('/offline', controller.offline);
module.exports = router;