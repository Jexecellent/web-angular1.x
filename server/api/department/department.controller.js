/**
 * Created by wayky on 15/10/23.
 */
 'use strict';
var http = require('../../components/http');
var Uris = require('../../utils/uris');
var Const = require('../../utils/const');

//列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_DEPARTMENT_LIST,req, res,function(data){
        res.send(data);
    });
};

//新增
exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_DEPARTMENT_ADD, req, res, function(data) {
        res.send(data);
    });
};

//修改
exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_DEPARTMENT_UPDATE, req, res, function(data) {
        res.send(data);
    });
};

//获取某个部门信息
exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_DEPARTMENT_GET, req, res, function(data) {
        res.send(data);
    });
};

//删除
exports.del = function(req, res) {
    http.postFormRequest(Uris.OPEN_DEPARTMENT_DEL, req, res, function(data) {
        res.send(data);
    });
};
