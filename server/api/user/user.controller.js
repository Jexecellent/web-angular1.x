/**
 * Created by wayky on 15/10/23.
 */
 'use strict';
var http = require('../../components/http');
var Uris = require('../../utils/uris');
var Const = require('../../utils/const');

//列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_USER_LIST,req, res,function(data){
        res.send(data);
    });
};

//新增
exports.addAdmin = function(req, res) {
    http.postFormRequest(Uris.OPEN_USER_ADDADMIN, req, res, function(data) {
        res.send(data);
    });
};

//修改
exports.updateAdmin = function(req, res) {
    http.postFormRequest(Uris.OPEN_USER_UPDATEADMIN, req, res, function(data) {
        res.send(data);
    });
};

//删除(修改状态)
exports.delAdmin = function(req, res) {
    http.postFormRequest(Uris.OPEN_USER_DELETEADMIN, req, res, function(data) {
        res.send(data);
    });
};

//获取单个
exports.getAdmin = function(req, res) {
    http.postFormRequest(Uris.OPEN_USER_GETADMIN, req, res, function(data) {
        res.send(data);
    });
};

//获取单个APP用户
exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_USER_GET, req, res, function(data) {
        res.send(data);
    });
};

//修改APP用户
exports.update = function(req, res) {
    console.log('update openuser, %j', req.body);
    http.postFormRequest(Uris.OPEN_USER_UPDATE, req, res, function(data) {
        res.send(data);
    });
};

//获取用户岗位 
exports.roleList = function(req, res) {
    http.postFormRequest(Uris.OPEN_USER_ROLELIST, req, res, function(data) {
        res.send(data);
    });
};