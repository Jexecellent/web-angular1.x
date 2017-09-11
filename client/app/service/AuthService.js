/**
 * Created by wayky on 15/10/23.
 */
;(function() {
    'use strict';

    angular.module('open.service')
        .factory('AuthService', ['$state', 'Restangular', 'CacheService', 'CommRestService', AuthService]);

    function AuthService($state, Restangular, CacheService, CommRestService) {
        /**
         * 登录
         * @param userInfo
         * @param failCb
         * @param afterLoginSucc
         */
        var fLogin = function (userInfo, failCb, afterLoginSucc) {
            if (!!Restangular.defaultHeaders["open-token"]) {
                delete Restangular.defaultHeaders["open-token"];
            }
            CommRestService.post('base/login', userInfo, function (dataBody) {
                    var data = dataBody.t;
                    if (dataBody.code == 2999) {
                        if (_.isFunction(afterLoginSucc)) {
                            afterLoginSucc({code: 2999, appList: data});
                        }
                    }
                    else if (dataBody.code == 0) {
                        var token = data.token;
                        if (token) {
                            //更新open-token
                            CacheService.putToken(token);
                            Restangular.setDefaultHeaders({"open-token": token});

                            var currentLoginUser = {
                                uid: data.uid,
                                iid: data.iid,
                                rid: data.rid,
                                sex: data.sex,
                                op: data.op,
                                userName: (data.nickName || data.loginName),
                                loginName: data.loginName,
                                imgPath: data.imgPath || '',
                                itype: data.interestOperateType,
                                iname: data.interestName,
                                appLogo: data.appLogo,
                                userAccount: data.loginName
                            };
                            CacheService.putObject('current_user', currentLoginUser);

                            if (_.isFunction(afterLoginSucc)) {
                                afterLoginSucc(currentLoginUser);
                            }
                        }
                    }
                    else {

                    }
                },
                failCb, true /* 需要整体返回数据体 */);
        };

        /**
         * 登出
         */
        var fLogout = function () {
            CommRestService.post('base/logout', {}, function () {
                CacheService.clear();
                $state.go('login');
            });
        };

        /**
         * 获取当前用户信息
         * @returns {*|Object}
         */
        var getUserInfo = function () {
            return CacheService.getObject("current_user");
        };

        /**
         * 获取当前用户名
         * @returns {*}
         */
        var getUserName = function () {
            var current_user = CacheService.getObject("current_user");
            if (current_user && current_user.userName) {
                return current_user.userName;
            }
            return null;
        };

        return {login: fLogin, logout: fLogout, getUserInfo: getUserInfo, getUserName: getUserName};
    }
})();