/**
 * Created by wayky on 15/10/23.
 */
;(function () {
    'use strict';

    angular.module('open.common')
        .config(fLoginConfig)
        .controller('LoginController', fLoginController);

    function fLoginConfig ($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                views: {
                    'view': {
                        templateUrl: 'app/common/auth/login.html',
                        controller: 'LoginController'
                    }
                }
            });
    }

    function fLoginController($rootScope, $scope, authService, $cookieStore, $state) {

        //登录对象
        if ($cookieStore.get('checkedPwd')) {
            //console.log($cookieStore.get('currentUser'));
            $scope.loginUser = $cookieStore.get('currentUser');
            $scope.checkedPwd = true;
        } else {
            $scope.loginUser = {
                username: '',
                password: ''
            };
        }

        $scope.selectAppToLogin = false;

        $scope.login = function() {
            authService.login($scope.loginUser, function(err) {
                $scope.valid = err.msg;
            }, function(userInfo) {

                //登录成功了
                store.set('user', $scope.loginUser);
                $cookieStore.put('currentUser',$scope.loginUser);
                $scope.valid = ''; //清除错误信息
                //先判断是否有code[2999]
                if (userInfo.code && userInfo.code == 2999) {
                    $scope.appList = userInfo.appList;
                    $scope.selectAppToLogin = true;
                } else {
                    //直接登录
                    $rootScope.currentUserName = userInfo.userName || "未知";
                    $state.go('main');
                }

            });
        };

        $scope.selectApp = function(selectedIid) {
            $scope.loginUser.iid = selectedIid;
            $scope.selectAppToLogin = false;
            authService.login($scope.loginUser, function(err) {
                $scope.selectAppToLogin = false;
                $scope.valid = err.msg;
            }, function(userInfo) {
                $rootScope.currentUserName = userInfo.userName || "未知";
                $state.go('main');
            });
        };

        $scope.blur = function() {
            $scope.valid = '';
        };

        $scope.savePwd = function() {
            if ($scope.checkedPwd) {
                $cookieStore.put('currentUser',$scope.loginUser);
                $cookieStore.put('checkedPwd',true);
            } else {
                $cookieStore.remove('currentUser');
                $cookieStore.put('checkedPwd',false);
            }
        };

        $rootScope.currentUserName = null;
    }
    fLoginController.$inject = ['$rootScope', '$scope', 'AuthService', '$cookieStore', '$state'];
})();