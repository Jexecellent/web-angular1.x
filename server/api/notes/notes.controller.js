/**
 * Created by wayky on 15/10/23.
 */
 'use strict';
var http = require("../../components/http");
var Uris = require("../../utils/uris");
var Const = require("../../utils/const");

//列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_NOTES_LIST,req, res,function(data){
        res.send(data);
    });
};

exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_NOTES_ADD, req, res, function(data) {
        res.send(data);
    });
};

exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_NOTES_UPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_NOTES_GET, req, res, function(data) {
        res.send(data);
    });
};

exports.offline = function(req, res) {
    http.postFormRequest(Uris.OPEN_NOTES_OFFLINE, req, res, function(data) {
        res.send(data);
    });
};

exports.del = function(req, res) {
    http.postFormRequest(Uris.OPEN_NOTES_DEL, req, res, function(data) {
        res.send(data);
    });
};