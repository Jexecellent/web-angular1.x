/**
 * Created by hxl on 2015/12/23.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .controller('colActivityJoinListController',fColActivityJoinListController);

    /**
     * 高校活动名单管理
     * @param $scope
     */
    function fColActivityJoinListController($scope,$rootScope,olActivityServices,CommTabService) {
        $scope.vcTabOnload = function(data, lastTabInfo) {
            $scope.lastTabInfo = lastTabInfo;
            $scope.params = {pageSize:10, pageNumber:1};
            if(data && data.act) {
                $scope.params.activityId = data.act.id;
                $scope.activity = data.act;
                search();
            }
        }
        $scope.search = function() {
            search(true);
        }
        function search(_new) {
            if(_new) {
                $scope.params.pageNumber = 1;
            }
            colActivityServices.joinList($scope.params,function(data) {
                _.each(data.content,function(n){
                    n._show = 0;
                });
                $scope.data = data;
            });
        }

        $scope.close = function() {
            CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.tag, {},[]);
        }

        /**
         * 导出excel
         */
        $scope.export = function() {

            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = $scope.activity.title;
            /*
            colActivityServices.exportJoin(_params, function(data){
                if (data.ret == 0){
                    location.href = encodeURI(data.excel);
                }
                else{
                    vcAlert("出错了，原因："+data.err);
                }
            });
            */
            $rootScope.exportExcel("college/join_export", _params);
        }

        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search(false);
        }

        $scope.update = function(join) {
            join._show = 0;
            join.joinId = join.id;
            join.opType = 5;
            join.activityId = $scope.activity_id;
            colActivityServices.update(join,function(data){
                TipService.add('success','更新成功',3000);
            });
        }
    }
    fColActivityJoinListController.$inject = ['$scope','$rootScope','colActivityServices','CommTabService'];
})();