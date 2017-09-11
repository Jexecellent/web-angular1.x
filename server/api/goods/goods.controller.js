/**
 * Created by wayky on 15/10/23.
 */
 'use strict';
var http = require('../../components/http');
var Uris = require('../../utils/uris');
var Const = require('../../utils/const');

//商品发布、列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_GOODS_LIST,req, res,function(data){
        res.send(data);
    });
};

exports.online = function(req, res){
    http.postFormRequest(Uris.OPEN_GOODS_ONLINE,req, res,function(data){
        res.send(data);
    });
};

exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_ADD, req, res, function(data) {
        res.send(data);
    });
};

exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_UPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.del = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_DEL, req, res, function(data) {
        res.send(data);
    });
};

exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_GET, req, res, function(data) {
        res.send(data);
    });
};


exports.offline = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_OFFLINE, req, res, function(data) {
        res.send(data);
    });
};

exports.updateBase = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_UPDATE_BASE, req, res, function(data) {
        res.send(data);
    });
};

//商品分类
exports.typeList = function(req, res){
    http.postFormRequest(Uris.OPEN_GOODS_TYPELIST,req, res,function(data){
        res.send(data);
    });
};

exports.typeAdd = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPEADD, req, res, function(data) {
        res.send(data);
    });
};

exports.typeUpdate = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPEUPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.typeGet = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPEGET, req, res, function(data) {
        res.send(data);
    });
};

exports.typeDel = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPEDEL, req, res, function(data) {
        res.send(data);
    });
};

//商品分类推荐
exports.recommendList = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPE_RECOMMAND_LIST, req, res, function(data) {
        res.send(data);
    });
};

exports.recommendAdd = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPE_RECOMMAND_ADD, req, res, function(data) {
        res.send(data);
    });
};

exports.recommendDel = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_TYPE_RECOMMAND_DELETE, req, res, function(data) {
        res.send(data);
    });
};
//商品品牌
exports.brandList = function(req, res){
    http.postFormRequest(Uris.OPEN_GOODS_BRANDLIST,req, res,function(data){
        res.send(data);
    });
};

exports.brandAdd = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_BRANDADD, req, res, function(data) {
        res.send(data);
    });
};

exports.brandUpdate = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_BRANDUPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.brandGet = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_BRANDGET, req, res, function(data) {
        res.send(data);
    });
};


exports.brandDel = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_BRANDDEL, req, res, function(data) {
        res.send(data);
    });
};

//商品规格
exports.specificationList = function(req, res){
    http.postFormRequest(Uris.OPEN_GOODS_SPECIFICATIONLIST,req, res,function(data){
        res.send(data);
    });
};

exports.specificationAdd = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_SPECIFICATIONADD, req, res, function(data) {
        res.send(data);
    });
};

exports.specificationUpdate = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_SPECIFICATIONUPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.specificationGet = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_SPECIFICATIONGET, req, res, function(data) {
        res.send(data);
    });
};


exports.specificationDel = function(req, res) {
    http.postFormRequest(Uris.OPEN_GOODS_SPECIFICATIONDEL, req, res, function(data) {
        res.send(data);
    });
};