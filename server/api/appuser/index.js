/**
 * Created by hxl on 2015/10/21.
 */
'use strict';

var express = require('express');
var controller = require('./appuser.controller');
var router = express.Router();

router.post('/list', controller.list);
router.post('/updatelevel', controller.updatelevel);


module.exports = router;
