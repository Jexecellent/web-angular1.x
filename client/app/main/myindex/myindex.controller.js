/**
 * Created by wayky on 15/10/21.
 */
;
(function () {
    'use strict';

    angular.module('main.myapp')
        .controller('MyindexController', fMyindexController)
        .controller('IndexMainController', ['$scope', 'CommRestService', fIndexMainController]);

    function fMyindexController($scope) {

    }

    function fIndexMainController($scope, CommRestService) {
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.loadData();
                $scope.$dirty = false;
            }
        };
        
        $scope.loadData = function () {
            CommRestService.post('module/get_homepage', {}, function (data) {
                console.log(data);
                $scope.moduleId = data.id;
                if (data.p) {
                    var json = JSON.parse(data.p);
                    $scope.iframeSrc = json.url;
                    $scope.showSrc();
                }
            }, function (err) {
                window.vcAlert(err.msg);
            });
        };

        $scope.submitSrc = function () {
            if ($scope.iframeSrc && $scope.moduleId) {
                CommRestService.post('module/update_homepage', {
                    moduleId: $scope.moduleId,
                    link: $scope.iframeSrc
                }, function (data) {
                    vcAlert("保存成功");
                }, function (err) {
                    window.vcAlert(err.msg);
                });
            }
        };

        $scope.showSrc = function () {
            if ($scope.iframeSrc) {
                //得判断用户有无输入http或https
                $("#iframe").attr("src", $scope.iframeSrc);
            }
        }
    }
})();