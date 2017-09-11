/**
 * Created by dengshaoxiang on 16/01/04.
 */
'use strict';
var http = require("../../components/http");
var Uris = require("../../utils/uris");
var Const = require("../../utils/const");

//列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_TYPE_LIST,req, res,function(data){
        res.send(data);
    });
};
exports.get = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_TYPE_GET,req, res,function(data){
        res.send(data);
    });
};
exports.logisticscompanyList = function(req, res){
    http.postFormRequest(Uris.OPEN_LOGISTICSCOMPANY_TYPE_List,req, res,function(data){
        res.send(data);
    });
};
exports.transportAdd = function(req, res){
    http.postFormRequest(Uris.OPEN_TRANSPORT_TYPE_ADD,req, res,function(data){
        res.send(data);
    });
};
exports.refund = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_REFUND,req, res,function(data){
        res.send(data);
    });
};
exports.receiveUpdate = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_RECEIVE_UPDATE,req, res,function(data){
        res.send(data);
    });
};
exports.cityList = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_CITY_LIST,req, res,function(data){
        res.send(data);
    });
};
exports.cancel = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_CANCEL,req, res,function(data){
        res.send(data);
    });
};
exports.logisticsGet = function(req, res){
    http.postFormRequest(Uris.OPEN_LOGISTICS_GET,req, res,function(data){
        res.send(data);
    });
};
exports.cityAddressList = function(req, res){
    http.postFormRequest(Uris.OPEN_ORDER_ADDRESS_LIST,req, res,function(data){
        res.send(data);
    });
};