/**
 * Created by hxl on 2015/10/23.
 */
'use strict'
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');
var Querystring = require("querystring");

exports.list = function(req, res) {
    http.postFormRequest(Uris.OPEN_ARTICLE_LIST, req, res, function(data) {
        res.send(data);
    });
};
exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_ARTICLE_ADD, req, res, function(data) {
        res.send(data);
    })
};
exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_ARTICLE_UPDATE, req, res, function(data) {
        res.send(data);
    })
};
exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_ARTICLE_GET, req, res, function(data) {
        res.send(data);
    })
};
exports.delete = function(req, res) {
    http.postFormRequest(Uris.OPEN_ARTICLE_DELETE, req, res, function(data) {
        res.send(data);
    })
};
exports.offline = function(req, res) {
    http.postFormRequest(Uris.OPEN_ARTICLE_OFFLINE, req, res, function(data) {
        res.send(data);
    })
};