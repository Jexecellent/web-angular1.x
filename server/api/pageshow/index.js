/**
 * Created by Administrator on 2016/1/5.
 */
'use strict'

var express     = require('express');
var router      = express.Router();
var controller  = require('./pageshow.controller');

router.post('/get', controller.get);
router.post('/save', controller.save);
router.post('/add', controller.add);
router.post('/update',controller.update);

module.exports = router;