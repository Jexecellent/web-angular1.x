/**
 * Created by wayky on 15/10/23.
 */
'use strict';
var http = require("../../components/http");
var Uris = require("../../utils/uris");
var Const = require("../../utils/const");
var exportExcel = require("../../components/excel/exportExcel");
var moment = require('moment');

//列表
exports.list = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_TYPELIST, req, res, function (data) {
        res.send(data);
    });
};

exports.disapplyList = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_DISAPPLY_TYPELIST, req, res, function (data) {
        res.send(data);
    });
};

exports.sellercodeGen = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_SELLERCODE_TYPEGEN, req, res, function (data) {
        res.send(data);
    });
};
exports.dispercentGet = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_DISPERCENT_TYPEGET, req, res, function (data) {
        res.send(data);
    });
};
exports.dispercentAdd = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_DISPERCENT_TYPEADD, req, res, function (data) {
        res.send(data);
    });
};
exports.audit = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_AUDIT, req, res, function (data) {
        res.send(data);
    });
};
exports.commissionList = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_COMMISSION_TYPELIST, req, res, function (data) {
        res.send(data);
    });
};
exports.commissionGet = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_COMMISSION_TYPEGET, req, res, function (data) {
        res.send(data);
    });
};
exports.payoffList = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_PAYOFF_TYPELIST, req, res, function (data) {
        res.send(data);
    });
};
exports.bonusList = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_BONUS_TYPELIST, req, res, function (data) {
        res.send(data);
    });
};
exports.bonusGet = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_BONUS_TYPEGET, req, res, function (data) {
        res.send(data);
    });
};
exports.commissionPayoff = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_COMMISSION_PAY, req, res, function (data) {
        res.send(data);
    });
};
exports.bonusPayoff = function (req, res) {
    http.postFormRequest(Uris.OPEN_DISTRIBUTE_BONUS_PAY, req, res, function (data) {
        res.send(data);
    });
};
exports.excel = function (req, res) {
    console.log(req.body);
    var url;
    if (req.body.url === 'distribute/commissionList') {//佣金待发
        url = Uris.OPEN_DISTRIBUTE_COMMISSION_TYPELIST;
    } else if (req.body.url === 'distribute/bonusList') {//奖金待发
        url = Uris.OPEN_DISTRIBUTE_BONUS_TYPELIST;
    } else if (req.body.url === 'distribute/payoffList') {//发放记录
        url = Uris.OPEN_DISTRIBUTE_PAYOFF_TYPELIST;
    }
    if (!!req.body["open-token"]) {
        req.headers['open-token'] = req.body["open-token"];
    }
    http.postFormRequest(url, req, res, function (data) {
        var cols = [
            {id: 'name', caption: '账户', type: 'string'},
            {id: 'nickname', caption: '昵称', type: 'string'},
            {id: 'loginName', caption: '手机', type: 'string'},
            {id: 'account', caption: '收款账号', type: 'string'}];
        if (req.body.type === 1) {//佣金
            if (req.body._status === 1) {//待发
                cols.push({id: 'toBeCommission', caption: '佣金', type: 'string'});
            } else if (req.body._status === 2) {//已发
                cols.push({id: 'time', caption: '明细', type: 'string'});
                cols.push({id: 'amount', caption: '佣金', type: 'string'});
                cols.push({id: 'opname', caption: '结算人', type: 'string'});
                cols.push({id: 'createTime', caption: '结算时间', type: 'string'});
            }
        } else if (req.body.type === 2) {//奖金
            if (req.body._status === 1) {//待发
                cols.push({id: 'toBeBonus', caption: '团队奖金', type: 'string'});
            } else if (req.body._status === 2) {//已发
                cols.push({id: 'time', caption: '明细', type: 'string'});
                cols.push({id: 'amount', caption: '团队奖金', type: 'string'});
                cols.push({id: 'opname', caption: '结算人', type: 'string'});
                cols.push({id: 'createTime', caption: '结算时间', type: 'string'});
            }
        }
        console.log(JSON.stringify(cols));
        data = JSON.parse(data);
        data = data.t.content;
        var _create_time;
        var _last_send_time;
        var _send_time;
        for (var e in data) {
            console.log('old:' + JSON.stringify(data[e]));
            data[e].name = data[e].name || '';
            data[e].nickname = data[e].nickname || '';
            data[e].loginName = data[e].loginName || '';
            data[e].account = data[e].account || '';
            if (req.body._status === 1) {
                if (req.body.type === 1) {
                    data[e].toBeCommission = (data[e].toBeCommission || '0') + '元';
                } else if (req.body.type === 2) {
                    data[e].toBeBonus = (data[e].toBeBonus || '0') + '元';
                }
            } else if (req.body._status === 2) {
                if (data[e].createTime) {
                    _create_time = moment(data[e].createTime).format("YYYY-MM-DD HH:mm");
                    data[e].createTime = _create_time || '';
                } else {
                    data[e].createTime = '';
                }
                if (data[e].lastSendTime && data[e].sendTime) {
                    _last_send_time = moment(data[e].lastSendTime).format("YYYY-MM-DD HH:mm");
                    _send_time = moment(data[e].sendTime).format("YYYY-MM-DD HH:mm");
                    data[e].time = _last_send_time + '至' + _send_time;
                } else {
                    data[e].time = '';
                }
                data[e].amount = (data[e].amount || '0' ) + '元';
                data[e].opname = data[e].opname || '';
            }
            console.log('new:' + JSON.stringify(data[e]));
        }
        //如有必要，处理一下data
        exportExcel.export(cols, data, res, req.body.fileName);
    });
};

