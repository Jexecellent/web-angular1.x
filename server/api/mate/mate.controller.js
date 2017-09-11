/**
 * Created by hxl on 2015/10/27.
 */
'use strict'
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');
var Querystring = require("querystring");

exports.list = function(req, res) {
    http.postFormRequest(Uris.OPEN_MATE_LIST, req, res, function(data) {
        res.send(data);
    });
};
exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_MATE_ADD, req, res, function(data) {
        res.send(data);
    })
};
exports.offline = function(req, res){
    http.postFormRequest(Uris.OPEN_MATE_OFFLINE, req, res, function(data){
        res.send(data);
    });
};
exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_MATE_GET, req, res, function(data){
        res.send(data);
    });
};