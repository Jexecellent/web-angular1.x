/**
 * Created by wayky on 15/10/23.
 */
 'use strict';
var http = require('../../components/http');
var Uris = require('../../utils/uris');
var Const = require('../../utils/const');

//列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_MODULE_LIST,req, res,function(data){
        res.send(data);
    });
};

//修改
exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_MODULE_UPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.getHome = function(req, res) {
    http.postFormRequest(Uris.OPEN_MYINDEX_GET, req, res, function(data) {
        console.log('get myindex list data:'+data);
        res.send(data);
    });
};

exports.updateHome = function(req, res) {
    http.postFormRequest(Uris.OPEN_MYINDEX_UPDATE, req, res, function(data) {
        res.send(data);
    });
};
//新增
/*exports.add = function(req, res) {
    console.log('add openuser, %j', req.body);
    http.postFormRequest(Uris.OPEN_OPENUSER_ADD, req, res, function(data) {
        res.send(data);
    });
};

*/