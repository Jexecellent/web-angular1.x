/**
 * Created by hxl on 2015/11/4.
 */
'use strict'
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');
var Querystring = require("querystring");

exports.list = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_LIST, req, res, function(data) {
        res.send(data);
    });
};
exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_ADD, req, res, function(data) {
        res.send(data);
    })
};
exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_UPDATE, req, res, function(data) {
        res.send(data);
    })
};
exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_GET, req, res, function(data) {
        res.send(data);
    })
};
exports.del = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_DEL, req, res, function(data) {
        res.send(data);
    })
};
exports.nopass = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_NOPASS, req, res, function(data) {
        res.send(data);
    })
};

exports.save = function(req, res) {
    http.postFormRequest(Uris.OPEN_AUDIT_SAVE, req, res, function(data) {
        res.send(data);
    });
};
