;(function() {
    'use strict';

    var openApp = angular.module('openApp', [
        'ngCookies',
        'ngSanitize',
        'ui.router',
        'restangular',
        'oc.lazyLoad',
        'oitozero.ngSweetAlert',
        'once',
        'open.common',
        'open.main',
        'open.service'
    ]);

    //基础服务
    angular.module('open.service', []);
    angular.module('open.common', []);

    //常量
    openApp.constant('vcTabsBroadcastKey', '$vcTabsCommonBroadcast$');

    //基础配置
    var fOpenAppConfig = function($urlRouterProvider, $locationProvider, RestangularProvider) {
        $urlRouterProvider.when('/', '/main');
        $urlRouterProvider.otherwise('/pg_not_found');
        $locationProvider.html5Mode(true); //去掉菜单栏url中的#   .hashPrefix('!');
    };
    openApp.config(['$urlRouterProvider', '$locationProvider', 'RestangularProvider', fOpenAppConfig]);

    var fDefaultController = function($rootScope, $scope, AuthService, CacheService) {

        //index.html 用到的方法 rootScope 作用域
        //退出
        $rootScope.logout = function(){
            //先确认
            vcAlert({
                title: "",
                text: "确定退出",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function() {
                AuthService.logout();
            });
        };

        //判断有无权限
        $rootScope.hasPermission = function(permission){
            if (permission && permission.indexOf(',') != -1) {
                permission = permission.split(',');
            }
            return CacheService.hasPermission(permission);
        };

        //当前用户名
        $rootScope.isLogined = false;

        $rootScope.$currentAppName  = "";
        $rootScope.$currentRid = 0;
        $rootScope.currentUserName = AuthService.getUserName();

        $rootScope.$watch('currentUserName', function(usrName){
            if (!!usrName) {
                var userInfo = AuthService.getUserInfo();
                if (userInfo) {
                    $rootScope.$currentAppName = userInfo.iname;
                    $rootScope.$currentRid = userInfo.rid;
                    $rootScope.isLogined = true;
                }
            }
            else {
                $rootScope.$currentAppName  = null;
                $rootScope.$currentRid = 0;
                $rootScope.isLogined = false;
            }
        });

        //是否开启免登录模式 - false For Dev
        $rootScope.VC_isOpenAuth = true;

        //文件流方式导出Excel
        $rootScope.exportExcel = function(postUrl, intoParams) {
            var params = null;
            if (_.isArray(intoParams)) {
                params = intoParams;
            }
            else if (_.isPlainObject(intoParams)){
                params = [];
                _.map(intoParams, function(v,k){
                    params.push({name:k, value:v});
                });
            }

            if (!!postUrl && _.isArray(params)) {
                var form = angular.element("<form>");//定义一个form表单
                form.attr("style","display:none");
                form.attr("target","");
                form.attr("method","post");
                form.attr("action","/api/" + postUrl);

                //带上token和时间戳
                params.push({name:'open-token',value:CacheService.getToken()});
                params.push({name:'ts',value:Date.now()});

                _.each(params, function (param) {
                    var input = angular.element("<input>");
                    input.attr("type", "hidden");
                    input.attr("name", param.name);
                    input.attr("value", param.value);
                    form.append(input);
                });

                angular.element("body").append(form);//将表单放置在web中
                form.submit();//表单提交
                form.remove();
            }
        };
    };
    fDefaultController.$inject = ['$rootScope', '$scope', 'AuthService', 'CacheService'];
    openApp.controller('DefaultController', fDefaultController);

    //路由切换监听
    openApp.run(['$rootScope', '$location', '$timeout', 'Restangular', 'CacheService', 'AuthService', function ($rootScope, $location, $timeout, Restangular, CacheService, AuthService) {

        // Redirect to login if token is expired
        $rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState, fromParams) {
            //console.log('stateChange: %s -> %s', fromState.url, toState.url);
            if (toState.url !== '/login') {
                if (!CacheService.isTokenValid() && $rootScope.VC_isOpenAuth) {
                    //token过期
                    CacheService.clear();
                    $location.path('/login');
                }
                $rootScope.isInLoginPg = false;
            }
            else{
                $rootScope.isInLoginPg = true;
            }
        });

        //设置全局Restangular配置
        Restangular.setBaseUrl('/api');

        Restangular.setDefaultHeaders({"open-token": CacheService.getToken()});

        Restangular.addRequestInterceptor(function(elem, operation, path, url){
            //让每次请求自动加上时间戳
            elem.ts = Date.now();
            return elem;
        });

        Restangular.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            if (data.success === true) {
                return data;
            }
            else{
                //错误返回
                deferred.reject(data);
            }
        });

        Restangular.setErrorInterceptor(function(response) {
            if (response.status === 401 && $rootScope.VC_isOpenAuth) {
                CacheService.clear();
                $location.path('/login');
            }
            else if (response.status === 403){
                sweetAlert("对不起，您没有该操作权限。");
            }
            else{
                if (response.status === 500){
                    sweetAlert("后台系统异常。");
                }
                else {
                    sweetAlert("后台服务异常，状态码:"+response.status);
                }

                //3秒后取消loading
                $timeout(function(){
                    $(".o_loading").addClass("ng-hide");
                }, 3000);
            }
            return false;
        });

        if (window.sweetAlert) {
            //全局对话框
            window.vcAlert = window.sweetAlert;
        }

        if (!window.ArrayRemove) {
            //从数组移除指定的值
            window.ArrayRemove = function (array, value) {
                _.remove(array, value);
            };
        }

        if (!window.htmlEncode) {
            window.htmlEncode = function (str) {
                var div = document.createElement("div");
                var text = document.createTextNode(str);
                div.appendChild(text);
                var html =  div.innerHTML;
                div = null; text = null;
                return html;
            }
        }

        if (!window.htmlDecode) {
            window.htmlDecode = function (str) {
                var div = document.createElement("div");
                div.innerHTML = str;
                var txt = div.innerText || div.textContent;
                div = null;
                return txt;
            }
        }
    }]);

})();