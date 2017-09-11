/**
 * 公共Restful API接口调用服务
 * Created by wayky on 15/10/23.
 */
;(function() {
    'use strict';

    angular.module('open.service')
        .factory('CommRestService', ['Restangular', function (Restangular) {

            var _services = {};

            var _getService = function (path) {
                var _service = _services[path];
                if (!_service) {
                    _service = Restangular.one.apply(this, path.split('/'));
                    _services[path] = _service;
                }
                return _service;
            };

            var _request = function (path, data) {
                //返回promise
                return _getService(path).customPOST(data);
            };

            return {
                post: function (path, data, cb, failCb, totalBody) {
                    //不返回promise，通过回调处理数据
                    _request(path, data).then(
                        function (data) {
                            if (!!cb) {
                                if (!!totalBody) {
                                    cb(data);
                                }
                                else {
                                    cb(data.t);
                                }
                            }
                        },
                        function (err) {
                            if (!!failCb) {
                                //交给业务自己处理
                                failCb(err);
                            }
                            else {
                                //将所有loading隐藏起来
                                $(".o_loading").addClass("ng-hide");

                                //系统自动全局提示
                                if (window.vcAlert) {
                                    err.msg ? vcAlert('操作失败:' + err.msg) : vcAlert('操作失败:未知错误');
                                }
                            }
                        }
                    );
                }
            };

        }]);
})();