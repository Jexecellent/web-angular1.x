/**
 * Created by hxl on 2015/10/16.
 */
var http  = require('../../components/http');
var Uris  = require('../../utils/uris');
var Querystring = require("querystring");
var exportExcel = require("../../components/excel/exportExcel");
var util = require('util');

var moment = require('moment');

exports.getActivityList = function(req, res) {

    http.postFormRequest(Uris.OPEN_ACTIVITY_LIST, req, res, function(data) {
        res.send(data);
    });

};

exports.add = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_ADD, req, res, function(data) {
        res.send(data);
    })
};

exports.get = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_GET, req, res, function(data) {
        res.send(data);
    })
};

exports.exportExcel = function(req, res) {
    if (!!req.body["open-token"]) {
        req.headers['open-token'] = req.body["open-token"];
    }
    http.postFormRequest(Uris.OPEN_ACTIVITY_GET, req, res, function(data) {
        //Todo:定义excel的格式和从data获取的字段
        var cols = [
            {id:'idx',caption:'排名', type:'number'},
            {id:'id',caption:'openid', type:'string'},
            {id:'nick_name',caption:'名称', type:'string'},
            {id:'score',caption:'投票数', type:'number'}
        ];
        //如有必要，处理一下data
        exportExcel.export(cols, data, res, req.body.fileName);
    })
};

exports.update = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_UPDATE, req, res, function(data) {
        res.send(data);
    })
};

exports.offline = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_OFFLINE, req, res, function(data) {
        res.send(data);
    })
};

exports.join_list = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_JOIN_LIST, req, res, function(data){
        res.send(data);
    });
};

exports.join_update = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_JOIN_UPDATE, req, res, function(data){
        res.send(data);
    });
};

exports.join_export = function(req, res) {
    if (!!req.body["open-token"]) {
        req.headers['open-token'] = req.body["open-token"];
    }
    http.postFormRequest(Uris.OPEN_ACTIVITY_JOIN_LIST, req, res, function(data){
        var cols = [
            {id:'name',caption:'账号', type:'string'},
            {id:'phone',caption:'手机号', type:'string'},
            {id:'sex',caption:'性别', type:'string'},
            {id:'createTime',caption:'报名时间', type:'string'},
            {id:'place',caption:'集合地', type:'string'},
            {id:'agent',caption:'报名人', type:'string'},
            {id:'remark',caption:'备注', type:'string'},
            {id:'sign',caption:'签到', type:'string'}
        ];
        data = JSON.parse(data);
        data = data.t.content;
        var _cur_join;
        var _date_time;
        for(var e in data) {
            _cur_join = data[e];
            _date_time = moment(_cur_join.createTime).format("YYYY-MM-DD HH:mm");
            data[e].createTime = _date_time||'';
            if(data[e].sex == 1) {
                data[e].sex = '男';
            }else {
                data[e].sex = '女';
            }
            data[e].sign = '';
            data[e].name = data[e].name ||'';
            data[e].phone = data[e].phone||'';
            data[e].place = data[e].place||'';
            data[e].agent = data[e].agent||'';
            data[e].remark = data[e].remark||'';
            //console.log(util.inspect(data[e]));
        }
        //如有必要，处理一下data
        exportExcel.export(cols, data, res, req.body.fileName);
    });
};

exports.union_list = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_UNION_LIST, req, res, function(data){
        res.send(data);
    });
};

exports.union_add = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_UNION_ADD, req, res, function(data){
        res.send(data);
    });
};

exports.union_cancel = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_UNION_CANCEL, req, res, function(data){
        res.send(data);
    });
};

exports.union_enter = function(req, res) {
    http.postFormRequest(Uris.OPEN_ACTIVITY_UNION_ENTER, req, res, function(data){
        res.send(data);
    });
};