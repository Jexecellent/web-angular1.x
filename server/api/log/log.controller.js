/**
 * Created by Administrator on 2016/1/7.
 */
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');
var exportExcel = require("../../components/excel/exportExcel");
var underscore = require('underscore');
var moment = require('moment');

exports.list = function(req, res) {

    http.postFormRequest(Uris.OPEN_LOG_LIST, req, res, function(data) {
        console.log('log response ', data);
        res.send(data);
    });
};

exports.export = function(req, res) {

    if (!!req.body["open-token"]) {
        req.headers['open-token'] = req.body["open-token"];
    }

    http.postFormRequest(Uris.OPEN_LOG_LIST, req, res, function(data) {
        data = JSON.parse(data);
        data = data.t.content;
        var cols = [
            {id:'nickname',caption:'操作人', type:'string'},
            {id:'createTime',caption:'日期', type:'string'},
            {id:'desc',caption:'操作项目', type:'string'},
            {id:'title',caption:'标题', type:'string'}
        ];
        var _rids = [];
        underscore.each(data,function(d) {
            _rids.push(d.rid);
            d.createTime = moment(d.createTime).format("YYYY-MM-DD HH:mm:ss");
        });
        //console.log('rids:', _rids);
        //console.log('data', data);

        var _req = underscore.clone(req);
        _req.body = {'pageSize':999,'pageNumber':1,rids:_rids.join(',')};
        http.postFormRequest(Uris.OPEN_USER_LIST, _req, res, function(page_users){
            var _users = JSON.parse(page_users).t.content;
            underscore.each(data, function(n) {
                underscore.each(_users, function(u) {
                    if(u.id === n.rid) {
                        n.nickname = u.nickname;
                        return;
                    }
                });
            });
            exportExcel.export(cols, data, res, req.body.fileName);
        });
    });
}