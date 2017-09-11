var util = {};
var guid = 1000;
var config = null;
util.setConfig = function(c) {
    config = c;
}
util.getFileName = function(extname) {
    var d = new Date();
    var name = [ d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(),
                 d.getMinutes(), d.getSeconds(), d.getMilliseconds(), guid++ ]
                .join('_') + extname;
    return name;
}
util.getUrlRoot = function (dPath) {
    if (config.mode == 'local')
        return dPath;
    else return config.hostName + '/' + config.staticPath;
}
util.getRealDynamicPath = function (req) {
    var dPath = config.dynamicPath;
    if (typeof dPath == 'function')
        dPath = dPath(req);
    return dPath;
}
util.stringify = function (obj) {
    var str = obj;
    try {
        str = JSON.stringify(obj);
    }catch (e) {
    }
    return str;
}
util.parseJson = function (str) {
    var obj = {};
    try {
        obj = JSON.parse(str);
    }catch (e) {
    }
    return obj;
}
util.readdir = function(path, callback) {
    if (config.mode == 'varicom') {
        //util.bcsListObject(dPath, callback);
        callback(null, "");
    } else {
        fs.readdir(path.join(config.staticPath, dPath), callback);
    }
}
module.exports = util;