/**
 * Created by hxl on 2015/10/29.
 */
'use strict'
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');
var Querystring = require('querystring');

exports.list = function(req, res) {
    http.postFormRequest(Uris.OPEN_BANNER_LIST, req, res, function(data) {
        res.send(data);
    });
};
exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_BANNER_ADD, req, res, function(data) {
        res.send(data);
    });
};
exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_BANNER_UPDATE, req, res, function(data) {
        res.send(data);
    });
};

exports.offline = function(req, res) {
    http.postFormRequest(Uris.OPEN_BANNER_OFFLINE, req, res, function(data) {
        res.send(data);
    });
};

exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_BANNER_GET, req, res, function(data) {
        res.send(data);
    });
};


exports.del = function(req, res) {
    http.postFormRequest(Uris.OPEN_BANNER_DEL, req, res, function(data) {
        res.send(data);
    });
};