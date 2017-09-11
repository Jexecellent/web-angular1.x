/**
 * Created by hxl on 2016/1/5.
 */
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');

exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_PAGESHOW_GET, req, res, function(data) {
        res.send(data);
    });
};

exports.save = function(req, res) {
    http.postFormRequest(Uris.OPEN_PAGESHWO_SAVE, req, res, function(data) {
        res.send(data);
    });
};

exports.add = function(req, res) {
    console.log('add page_show', req.body);
    req.body = {'content':req.body.data,auditId:req.body.auditId};
    http.postFormRequest(Uris.OPEN_PAGESHWO_SAVE, req, res, function(data) {
        res.send(data);
    });
};

exports.update = function(req, res) {
    console.log('update page_show', req.body);
    req.body = {'content':req.body.data,auditId:req.body.auditId};
    http.postFormRequest(Uris.OPEN_PAGESHWO_SAVE, req, res, function(data) {
        res.send(data);
    });
};