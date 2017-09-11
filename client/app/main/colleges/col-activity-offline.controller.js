/**
 * Created by hxl on 2015/12/23.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .controller('colActivityOfflineController',fColActivityOfflineController);

    function fColActivityOfflineController($scope,colActivityServices, CommTabService,CacheService,
                                           previewModalService) {
        $scope.vcTabOnload = function(data, fromIndex) {
            if($scope.dirty){
                init();
                $scope.dirty = false;
            }
        }
        function init() {
            $scope.sparams = colActivityServices.offline_params;
            search();
        }
        init();
        function search() {
            var _params = colActivityServices.getOfflineQueryParams();
            colActivityServices.list(_params,function(data){
                $scope.data = data;
            });
        }
        $scope.toEdit = function(act) {
            CommTabService.next($scope.$vcTabInfo,'col-act-tab-add',{
                op_type : 4,
                dataId  : act.id
            },'col_actTabs',[]);
        }
        /**
         * 名单管理
         */
        $scope.activityJoin = function(act) {
            CommTabService.next($scope.$vcTabInfo, 'act_join_list', {act:act});
        }

        $scope.goPage = function(num) {
            $scope.sparams.pageNumber = num;
            search(false);
        }
        function permissionBind() {
            $scope.pms = colActivityServices.permission;
        }
        permissionBind();

        $scope.preview = function(act) {
            colActivityServices.get({activityId:act.id},function(data) {
                var _cur_time = new Date().getTime();
                CacheService.putObject('preview_college', data.activityInfo);
                previewModalService.activate({
                    f_src:'/assets/preview/college/index.html?r='+_cur_time
                });
            });
        }
    }
    fColActivityOfflineController.$inject = ['$scope','colActivityServices','CommTabService',
    'CacheService','previewModalService'];
})();