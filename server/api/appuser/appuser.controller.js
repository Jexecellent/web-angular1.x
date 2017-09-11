/**
 * Created by hxl on 2015/10/21.
 */
var http = require("../../components/http");
var Uris = require("../../utils/uris");
var Const = require("../../utils/const");

//列表
exports.list = function(req, res){
    http.postFormRequest(Uris.OPEN_APPUER_LIST,req, res,function(data){
        res.send(data);
    });
};

//用户身份修改
exports.updatelevel = function(req, res){
    http.postFormRequest(Uris.OPEN_APPUER_lUPDATELEVEL,req, res,function(data){
        res.send(data);
    });
};