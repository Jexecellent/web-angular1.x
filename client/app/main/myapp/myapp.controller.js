/**
 * Created by wayky on 15/10/21.
 */
;
(function () {
    'use strict';

    angular.module('main.myapp')
        .controller('MyAppController', MyAppController)
        .controller('MyAppInfoController', MyAppInfoController);

    function MyAppController($scope){
        $scope.loading = false;
    }

    MyAppController.inject = ['$scope'];

    function MyAppInfoController($scope, CommRestService, AuthService, TipService) {
        $scope.appInfo = {};

        $scope.userInfo = AuthService.getUserInfo();

        $scope.$parent.loading = true;
        CommRestService.post('base/appinfo', {}, function (data) {
            $scope.appInfo = data;
            $scope.$parent.loading = false;
        });

        $scope.update = function () {
            var length = $scope.appInfo.desc.length;
            if(length > 200){
                TipService.add('warning', '描述长度不能超过200', 3000);
                return;
            }

            var param = {
                desc: $scope.appInfo.desc,
                appName: $scope.appInfo.appName,
                logo: $scope.appInfo.logo
            };

            $scope.$parent.loading = true;
            CommRestService.post('base/appupdate', param, function (data) {
                $scope.$parent.loading = false;
                TipService.add('success', '保存成功', 3000);
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('danger', err.msg, 3000);
            });
        }
    }

    MyAppInfoController.inject = ['$scope', 'CommRestService', 'AuthService', 'TipService'];
})();