/**
 * Created by wayky on 15/10/15.
 */
var URL = require("url");
var Underscore = require("underscore");
var Querystring = require("querystring");
var HttpBase    = require('http');
var BufferHelper = require('bufferhelper');
var HttpClient  = require('node-rest-client').Client;
var varicom     = require("../../utils/utils");

var http = {
    OPEN_REST_DOMAIN : "http://openrest.varicom.im",
    httpClient : new HttpClient()
};

/*
http._initReq = function(req) {
    var params = URL.parse(req.url, true).query;
    var _uri = params.uri;
    var _keys = Underscore.keys(params);
    var _params = "";
    if (Underscore.isArray(_keys)) {
        Underscore.each(_keys, function(_key){
            if (_key !== 'uri') {
                if(_params == ""){
                    _params += _key + "=${" + _key + "}";
                }else{
                    _params += "&" + _key + "=${" + _key + "}";
                }
            }
        });
        _params += "&ts=" + (new Date().getTime());
    }
    return {uri:_uri, url: this.OPEN_REST_DOMAIN + _uri + '?' + _params, args: {path: params}};
};

http.postUrlRequest = function(req, callback) {
    var params = this._initReq(req);
    this.httpClient.post(params.url, params.args, function (data) {
        varicom.restlogger.info("%s|post|200|%j|%j", params.uri, params.args, data);
        callback(data);
    });
};

http.getRequest = function(req, callback) {
    var params = this._initReq(req);
    this.httpClient.get(params.url, params.args, function (data) {
        //Todo: maby leak
        varicom.restlogger.info("%s|get|200|%j|%j", params.uri, params.args, data);
        callback(data);
    });
};
*/

http.postFormRequest = function(uri, req, res, callback) {
    try {
        var formPostData = req.body;
        var data = Querystring.stringify(formPostData);

        var options = URL.parse(this.OPEN_REST_DOMAIN + uri);
        options.method = 'POST';
        options.headers = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            'Content-Length': data.length
        };

        options.headers["open-token"] = req.headers["open-token"] || "";
        var clientIp = varicom.getClientIp(req);
        options.headers["x-forwarded-for"] = clientIp;

        var _callback = function(response) {

            var bufferHelper = new BufferHelper();

            response.on('data', function (chunk) {
                bufferHelper.concat(chunk);
            });

            response.on('end', function () {
                var statusCode = response.statusCode;
                var html = bufferHelper.toBuffer().toString();
                varicom.restlogger.info("%s|%s|%s|%s", uri, statusCode, data, clientIp);
                varicom.restlogger.debug("%s|return|%s", uri, html);
                if (statusCode != 200) {
                    res && res.writeHead(statusCode);
                    res.end();
                    return;
                }
                callback(html);
            });
        };

        var req = HttpBase.request(options, _callback);
        req.write(data);
        req.end();
    }
    catch(er){
        console.log("Exception:%s", er.stack);
    }
};

module.exports = http;