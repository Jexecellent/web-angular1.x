var path = require('path');
var url = require('url');
var os = require('os');
var fs = require('fs');
var fse = require('fs-extra');
var Busboy = require('busboy');
var util = require('./util');

var vcupload = require('./vcupload');

var config = {
    configfile: '',
    mode: 'local',
    staticPath: '',
    dynamicPath: '',
    uploadRestAPI: ''
};
var ueditor = function(c) {
    setConfig(c);
    return function (req, res, next) {
        _ueditor(req, res, next);
    }
};
var setConfig = function(c) {
    for (var i in c) {
        config[i] = c[i];
    }
    util.setConfig(config);
}
var _ueditor = function(req, res, next) {
    switch (req.query.action) {
        case 'config':
            //为支持IE application/json 不提示下载
            var ua = req.headers["user-agent"] || "";
            if (ua.match(/(MSIE)\s+([\d.]+)/) || ua.match(/Trident\/([\d.]+)/)){
                //判断一下是否IE
                res.setHeader('Content-Type', 'text/html');
                res.redirect(config.configFile);
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.redirect(config.configFile);
            }
            break;
        case 'uploadimage':
            uploadfile(req, res);
            break;
        case 'listimage':
            listfile(req, res, '.jpg,.jpeg,.png,.gif,.ico,.bmp');
            break;
        case 'uploadscrawl':
            uploadscrawl(req, res);
            break;
        case 'uploadfile':
            uploadfile(req, res);
            break;
        case 'uploadvideo':
            uploadfile(req, res);
            break;
        case 'listfile':
            listfile(req, res, [".png", ".jpg", ".jpeg", ".gif", ".bmp",
                ".flv", ".swf", ".mkv", ".avi", ".rm", ".rmvb", ".mpeg", ".mpg",
                ".ogg", ".ogv", ".mov", ".wmv", ".mp4", ".webm", ".mp3", ".wav", ".mid",
                ".rar", ".zip", ".tar", ".gz", ".7z", ".bz2", ".cab", ".iso",
                ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt", ".md", ".xml"].join(','));
            break;
    }
}

var listfile = function (req, res, fileType) {
    var dPath = util.getRealDynamicPath(req);
    var urlRoot = util.getUrlRoot(dPath);
    var callback = function (err, files) {
        var r = {};
        if (err) {
            r.state = 'ERROR';
            res.status(500);
        } else r.state = 'SUCCESS';
        //var fileType = '.jpg,.jpeg,.png,.gif,.ico,.bmp';
        var data = [];
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var extname = path.extname(file);
            //console.log(file);
            if (fileType.indexOf(extname.toLowerCase()) >= 0) {
                data.push({
                    'url': urlRoot + '/' + file
                });
            }
        }
        r.list = data;
        r.start = 1;
        r.total = data ? data.length : 0;
        res.json(r);
    };
    if (config.mode == 'varicom') {
        //bcsListObject(dPath, callback);
        //我们业务不需要list
        callback(null, []);
    } else {
        fs.readdir(path.join(config.staticPath, dPath), callback);
    }
};

//var bcsListObject = function (path, callback) {
//    bcs.listObject(path, function (res) {
//        if (res.statusCode == 200) {
//            //console.log(res.data);
//            var data = res.data.object_list;
//            for (var i = data.length - 1; i >= 0; i--) {
//                data[i] = data[i].object;
//            }
//            callback(null, data);
//        } else {
//            callback(util.stringify(res.headers), []);
//        }
//    });
//}

/**
 * 我们业务重点关心此接口
 * @param req
 * @param res
 */
var uploadfile = function (req, res) {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var isReturn = false;
        save(file, filename, mimetype, req, function (err, retData) {
            //防止多次res.end()
            if (isReturn) return;
            isReturn = true;

            var retJson = {};
            if (err) {
                retJson = {
                    state: 'ERROR',
                    original: filename,
                    url : "not_valid_url"
                };
            }
            else{
                var url = "";
                var r = util.parseJson(retData);
                if (r.success){
                    url = r.t;
                }

                retJson = {
                    state: 'SUCCESS',
                    original: filename,
                    url : url
                };
            }

            //为支持IE application/json 不提示下载
            var ua = req.headers["user-agent"] || "";
            if (ua.match(/(MSIE)\s+([\d.]+)/) || ua.match(/Trident\/([\d.]+)/)){
                //判断一下是否IE
                res.setHeader('Content-Type', 'text/html');
                res.end(util.stringify(retJson));
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.json(retJson);
            }
        });
    });
    req.pipe(busboy);
};

//真正的上传实现
var save = function (file, filename, mimetype, req, callback) {
    var realName = util.getFileName(path.extname(filename));
    var dPath = util.getRealDynamicPath(req);
    var saveTo = path.join(os.tmpDir(), realName);
    file.pipe(fs.createWriteStream(saveTo));
    file.on('end', function() {
        var readPath = path.join(config.staticPath, dPath, realName);
        fse.move(saveTo, readPath, function(err) {
            if (err) {
                callback(err);
            } else {
                if (config.mode == 'varicom') {
                    var id = setTimeout(function () {
                        callback('timeout');
                    }, 10000);

                    var fileOption = {name: 'file', filename: realName, filetype: mimetype};
                    vcupload.upload(req, config.uploadRestAPI, readPath, fileOption, function (res, data) {
                        clearTimeout(id);
                        fs.unlink(readPath);
                        if (res.statusCode == 200) {
                            callback(null, data);
                        } else {
                            callback(util.stringify(res.headers), '');
                        }
                    });
                }
                else {
                    callback(null, dPath + '/' + realName);
                }
            }
        });
    });
}
//var bcsPutObject = function(buckect, object, acl, src, id, callback) {
//    bcs.putObject(buckect, object, acl, src, function (res){
//        clearTimeout(id);
//        if (res.statusCode == 200) {
//            callback(null, util.getUrlRoot(buckect) + '/' + object);
//        } else {
//            callback(util.stringify(res.headers), '');
//        }
//    });
//}

var uploadscrawl = function (req, res) {
    var realName = util.getFileName('.png');
    var saveTo = path.join(os.tmpDir(), realName);
    console.log(saveTo);
    util.base64Decode(req.body.upfile, saveTo);
    var dPath = util.getRealDynamicPath(req);
    var readPath = path.join(config.staticPath, dPath, realName);
    fse.move(saveTo, readPath, function(err) {
        var r = {
            'url': dPath + '/' + realName,
            'original': realName,
        }
        if (err) {
            r.state = 'ERROR';
        } else r.state = 'SUCCESS';
        res.json(r);
    });
}

module.exports = ueditor;