var crypto = require('crypto');
var URL = require("url");
var dgram = require("dgram");

var getlocalHost = function () {
    var os = require('os');
    var ifaces = os.networkInterfaces();
    var localIp = "";
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (localIp){ return; }
            if (iface.address && iface.address != "127.0.0.1") {
                localIp = iface.address;
            }
        });
    });

    return localIp;
};

var varicom = {
    tokenKey: "ac813523-6fcd-4108-8982-0a1dbe8c571e",
    localHost : getlocalHost(),
    version : 0
};

//每次系统重启时生成版本号
varicom.version = new Date().getTime();

//环境变量
varicom.isDev = function(){
    return true; // 正式环境必须为false！
};

//最新版本号
varicom.apkLatestVersion = "2.2.5";

//统一日志
varicom.restlogger = require('pomelo-logger').getLogger('openrest-log');

//md5加密
varicom.md5 = function (data) {
    return crypto.createHash('md5').update(data, "utf8").digest('hex');
};

//sha1加密
varicom.sha1 = function (data) {
    return crypto.createHash('sha1').update(data).digest('hex');
};

//输出udp日志
var udpLogSocket = dgram.createSocket("udp4");
udpLogSocket.bind(function () {
    udpLogSocket.setBroadcast(true);
});

var udpHost = varicom.isDev() ? "172.16.1.9" : "192.168.1.159";
var udpPort = 30001;
var SvrName = "openWeb";
varicom.udpLog = function (req) {
    var params = URL.parse(req.url, true).query;
    var ua = req.header('user-agent');
    var module = params.module || "play";
    var uid = params.uid||"";
    var rid = params.rid||"";
    var input = params.input||"";
    var result = params.result||"";
    var param = params.param||"";
    var localHost = this.localHost;
    var log = "|" + localHost + "|" + SvrName + "|" + module + "|" + uid + "|" + rid + "|" + input + "|" + result + "|" + param + "|" + ua + "\r\n";
    var udpLogMsg = new Buffer(log);
    udpLogSocket.send(udpLogMsg, 0, udpLogMsg.length, udpPort, udpHost, function (err, bytes) {
        console.log("send udplog " + log + " return " + (err ? "fail" : "success"));
    });
};

varicom.invokeCallback = function(cb) {
    if(!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * 取客户端用户ip
 * @param req
 * @returns {*}
 */
varicom.getClientIp = function(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
}

module.exports = varicom;
