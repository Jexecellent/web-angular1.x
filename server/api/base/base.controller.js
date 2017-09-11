/**
 * Created by wayky on 15/10/19.
 */
var http  = require('../../components/http');
var Const  = require('../../utils/const');
var Uris  = require('../../utils/uris');
var openCookie = require("../../utils/cookie");
var varicom     = require("../../utils/utils");
var formidable = require('formidable');
var fs = require('fs');

//登录
exports.login = function(req, res) {
    // 第一种方式（推荐）
    http.postFormRequest(Uris.BASE_LOGIN, req, res, function(data){
        //判断是否登录成功，成功的种下Cookie
        var result = JSON.parse(data);
        if (result.success == true && result.code === 0 && result.t) {
            openCookie.create(res, Const.OPEN_USER_COOKIE_KEY, result.t.token);
        }
        res.send(data);
    });
};

//用户基本信息
exports.baseinfo = function(req, res) {
    http.postFormRequest(Uris.BASE_BASE_INFO, req, res, function(data){
        res.send(data);
    });
};

//登出
exports.logout = function(req, res) {
    http.postFormRequest(Uris.BASE_LOGOUT, req, res, function (data) {
        var result = JSON.parse(data);
        if (result.success == true) {
            openCookie.remove(res, Const.OPEN_USER_COOKIE_KEY);
        }
        res.send(data);
    });
};

//获取用户权限表
exports.menus = function(req, res) {
    http.postFormRequest(Uris.BASE_AUTH, req, res, function (data) {
        res.send(data);
    });
};

//校验登录用户
exports.validate = function(req, res) {
    http.postFormRequest(Uris.BASE_BASE_INFO, req, res, function (data) {
        res.send(data);
    });
};

//获取配置
exports.config = function(req, res) {
    http.postFormRequest(Uris.BASE_CONFIG,req, res,function(data){
        res.send(data);
    });
};

//获取App栏目列表
exports.modules = function(req, res) {
    http.postFormRequest(Uris.BASE_MODULE_LIST,req, res,function(data){
        res.send(data);
    });
};

//上传文件
exports.fileUpload = function(req, res) {
    var options = require('url').parse(Const.OPENREST_DOMAIN + Uris.BASE_FILE_UPLOAD);
    options.method = 'POST';
    var callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            res.send(str);
        });
    };

    var request = require('http').request(options, callback);

    //formidable ,TODO 有时间研究更好的实现方式
    var form = new formidable.IncomingForm();   //创建上传表单
    form.keepExtensions = true;	 //保留后缀
    form.parse(req, function(err, fields, files) {
        uploadFile(files,{});
    });

    function uploadFile(files, postData) {
        var boundaryKey = Math.random().toString(16);
        var endData = '\r\n----' + boundaryKey + '--';
        var filesLength = 0, content;

        // 初始数据，把post过来的数据都携带上去
        content = (function (obj) {
            var rslt = [];
            Object.keys(obj).forEach(function (key) {
                arr = ['\r\n----' + boundaryKey + '\r\n'];
                arr.push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n');
                arr.push(obj[key]);
                rslt.push(arr.join(''));
            });
            return rslt.join('');
        })(postData);

        // 组装数据
        Object.keys(files).forEach(function (key) {
            if (!files.hasOwnProperty(key)) {
                delete files.key;
                return;
            }
            content += '\r\n----' + boundaryKey + '\r\n' +
                'Content-Type: '+files.file.type+'\r\n' +
                'Content-Disposition: form-data; name="' + key + '"; ' +
                'filename="' + files[key].name + '"; \r\n' +
                'Content-Transfer-Encoding: binary\r\n\r\n';
            files[key].contentBinary = new Buffer(content, 'utf-8');
            filesLength += files[key].contentBinary.length + fs.statSync(files[key].path).size;
        });

        //request.setHeader("Set-Cookie", ["token="+varicom.cookies(req).open_token]);
        request.setHeader('Content-Type', 'multipart/form-data; boundary=--' + boundaryKey);
        request.setHeader('Content-Length', filesLength + Buffer.byteLength(endData));

        // 执行上传
        var allFiles = Object.keys(files);
        var fileNum = allFiles.length;
        var uploadedCount = 0;
        allFiles.forEach(function (key) {
            request.write(files[key].contentBinary);
            var fileStream = fs.createReadStream(files[key].path, {bufferSize: 4 * 1024});
            fileStream.on('end', function () {
                // 上传成功一个文件之后，把临时文件删了
                fs.unlink(files[key].path);
                uploadedCount++;
                if (uploadedCount == fileNum) {
                    // 如果已经是最后一个文件，那就正常结束
                    request.end(endData);
                }
            });
            fileStream.pipe(request, {end: false});
        });
    }
};

//排序
exports.sort = function(req, res) {
    http.postFormRequest(Uris.BASE_SORT,req, res,function(data){
        res.send(data);
    });
};

//APP信息
exports.appinfo = function(req, res) {
    http.postFormRequest(Uris.BASE_APP_INFO,req, res,function(data){
        res.send(data);
    });
};

exports.appupdate = function(req, res) {
    http.postFormRequest(Uris.BASE_APP_UPDATE, req, res, function (data) {
        res.send(data);
    });
};

//待处理信息
exports.statTips = function(req, res) {
    http.postFormRequest(Uris.BASE_STAT_TIPS, req, res, function (data) {
        res.send(data);
    });
};

//主页App信息统计
exports.statisticsApp = function(req, res) {
    http.postFormRequest(Uris.BASE_STAT_APP, req, res, function (data) {
        res.send(data);
    });
};

//客户端协议
exports.jumpprotocol = function(req, res) {
    http.postFormRequest(Uris.BASE_JUMP_PROTOCOL, req, res, function (data) {
        res.send(data);
    });
};
