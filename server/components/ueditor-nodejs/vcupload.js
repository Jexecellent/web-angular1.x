var fs = require('fs');
var HttpBase    = require('http');

var vcupload = {};

vcupload.upload = function (openToken, apiPath, file, fileOption, callback) {
    var stat = fs.statSync(file);
    var boundaryKey = Math.random().toString(16);
    var endData = '\r\n----' + boundaryKey + '--';
    var requestProperty = ['\r\n----' + boundaryKey + '\r\n'];
    requestProperty.push('Content-Type: ' + fileOption.filetype + '\r\n');
    requestProperty.push('Content-Disposition: form-data; name="' + fileOption.name + '"; ' + 'filename="' + fileOption.filename + '"; \r\n');
    requestProperty.push('Content-Transfer-Encoding: binary\r\n\r\n');

    var reqBufferStr = requestProperty.join('');
    var requestPropertyBuffer = new Buffer(reqBufferStr, 'utf-8');

    var options = require('url').parse(apiPath);
    options.method = 'POST';
    options.headers = {
        'open-token': openToken,
        'content-length': requestPropertyBuffer.length + stat.size + Buffer.byteLength(endData),
        'content-type': 'multipart/form-data; boundary=--' + boundaryKey
    };
    var _callback = function(response) {
        var str = '';
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            callback(response, str);
        });
    };

    var request = HttpBase.request(options, _callback);

    request.write(requestPropertyBuffer);

    //console.log("vcupload - %s,%s,%s", requestPropertyBuffer.length , stat.size , Buffer.byteLength(endData));
    //console.log("vcupload - boundary:%s, failPath:%s", reqBufferStr, file);

    var fileStream = fs.createReadStream(file, {bufferSize: 4 * 1024});
    fileStream.on('end', function () {
        request.end(endData);
    });
    fileStream.pipe(request);
}

module.exports = vcupload;