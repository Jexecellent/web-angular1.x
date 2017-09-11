/**
 * 手记管理API
 */

'use strict';

var express = require('express');
var controller = require('./goods.controller');
var router = express.Router();
var rateLimit = require('express-rate-limit');

//商品发布、列表
router.post('/list', controller.list);
//router.post('/add', rateLimit({}), controller.add); //todo
router.post('/add', controller.add);
router.post('/update', controller.update);
router.post('/del', controller.del);
router.post('/get', controller.get);
router.post('/online', controller.online);
router.post('/offline', controller.offline);
router.post('/updateBase', controller.updateBase);

//商品分类
router.post('/typeList', controller.typeList);
router.post('/typeAdd', controller.typeAdd);
router.post('/typeUpdate', controller.typeUpdate);
router.post('/typeGet', controller.typeGet);
router.post('/typeDel', controller.typeDel);

//商品推荐
router.post('/recommendList', controller.recommendList);
router.post('/recommendAdd', controller.recommendAdd);
router.post('/recommendDel', controller.recommendDel);

//商品品牌
router.post('/brandList', controller.brandList);
router.post('/brandAdd', controller.brandAdd);
router.post('/brandUpdate', controller.brandUpdate);
router.post('/brandGet', controller.brandGet);
router.post('/brandDel', controller.brandDel);

//商品规格
router.post('/specificationList', controller.specificationList);
router.post('/specificationAdd', controller.specificationAdd);
router.post('/specificationUpdate', controller.specificationUpdate);
router.post('/specificationGet', controller.specificationGet);
router.post('/specificationDel', controller.specificationDel);



module.exports = router;
