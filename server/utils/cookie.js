/**
 * Created by wayky on 15/10/16.
 */

var openCookie = (function(){

    var _this = this;

    /**
     * 生成一个cookie值
     * @param name
     * @param value
     * @param expires
     * @param path
     * @param domain
     * @returns {string|*}
     */
    this._ = function (name, value, expires, path, domain) {
        var cookie = name + '=' + value + ';';
        //cookie有效期时间
        if (expires != undefined) {
            expires = parseInt(expires);
            var today = new Date();
            var time = today.getTime() + expires * 1000;
            var new_date = new Date(time);
            var expiresDate = new_date.toGMTString(); //转换成 GMT 格式。
            cookie += 'expires=' +  expiresDate + ';';
        }
        //目录
        if (path != undefined) {
            cookie += 'path=' +  path + ';';
        }
        //域名
        if (domain != undefined) {
            cookie += 'domain=' +  domain + ';';
        }
        return cookie;
    };

    /**
     * 创建单个cookie
     * @param res
     * @param name
     * @param value
     */
    this.create = function(res, name, value) {
        //var cookie = _this._(name, value, 3600, "/", ".varicom.im");
        var cookie = _this._(name, value, 3600, "/");
        res.setHeader("Set-Cookie", cookie);
    };

    /**
     * 删除单个cookie
     * @param res
     * @param name
     */
    this.remove = function(res, name) {
        //var cookie = _this._(name, '', 0, "/", ".varicom.im");
        var cookie = _this._(name, '', -100, "/");
        res.setHeader("Set-Cookie", cookie);
    };

    return _this;
})();

module.exports = openCookie;