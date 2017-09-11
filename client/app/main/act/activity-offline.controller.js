/**
 * Created by hxl on 2015/11/28.
 */
;(function(){
    'use strict'
    angular.module('main.act')
        .controller('ActivityOfflineListController',fActivityOfflineListController);
    /**
     * 下线活动列表ctrl
     * @param $scope
     * @param activityListService
     */
    function fActivityOfflineListController($scope,activityListService,dateTimeService,activityJoinListLayoutService,
                                            cycleActivityJoinListLayoutService,contestActivityJoinListLayoutService,
                                            vcModalService,CommTabService) {
        $scope.params = {pageSize:10,pageNumber:1,status:2};
        $scope.vcTabOnload = function(data) {
            if($scope.$dirty) {
                search(false);
                $scope.$dirty = false;
            }
        }
        function search(_new) {
            if(_new) {
                $scope.params.pageNumber = 1;
            }
            $scope.$parent.loading = true;
            activityListService.list($scope.params, function(data) {
                console.log('offline activity list.',data);
                $scope.data = data;
                $scope.$parent.loading = false;
            },function (err) {
                vcAlert(err.msg);
                $scope.$parent.loading = false;
            });
        }

        $scope.goPage = function(num) {
            $scope.params.pageNumber = num;
            search(false);
        }
        /**
         * 报名列表
         */
        $scope.activityJoin = function(act) {
            var _curTime = new Date().getTime();
            var z_index = _curTime - dateTimeService.getTimeUpToNow(0);
            if(act.subType === 1) {
                activityJoinListLayoutService.activate({activity_id:act.id,activity:act},{'z-index':z_index});
            }else if(act.subType === 2) {
                cycleActivityJoinListLayoutService.activate({activity_id:act.id,subTags:act.subTags,activity:act},
                    {'z-index':z_index});
            }else if(act.subType ===3) {
                contestActivityJoinListLayoutService.activate({activity_id:act.id,eventGroupInfo:act.eventGroupInfo,activity:act},
                    {'z-index':z_index});
            }
        }
        search();
        var _cur_activity = null;
        /**
         * 编辑
         */
        $scope.toEdit = function(act) {
            _cur_activity = act;
            if(act.unionState === 3) {//来自其他世界的活动，编辑联盟信息
                vcModalService({
                    retId:'params',
                    backdropCancel: false,
                    title: '编辑联盟',
                    css: {height: '415px',width: '400px'},
                    templateUrl: 'app/templates/activity/enter_union_activity.html',controller: 'enterUnionActivityController',
                    success: {label: '确定',fn: editUnion}
                },{
                    union:act
                });
            }else {
                //$state.go('main.activityedit',{type:'update',id:act.id});
                /*
                var tabInfo = angular.copy($scope.$vcTabInfo);
                angular.extend(tabInfo, {root:'actTabs'});
                CommTabService.next(tabInfo, 1, {
                    operate: 'offlineEdit',
                    dataId: act.id
                });
                */
                CommTabService.next($scope.$vcTabInfo,'act-tab-add',{
                    operate: 'offlineEdit',
                    dataId: act.id
                },'actTabs');
            }
        }
    }
    fActivityOfflineListController.$inject = ['$scope','activityListService','dateTimeService',
        'activityJoinListLayoutService','cycleActivityJoinListLayoutService','contestActivityJoinListLayoutService'
        ,'vcModalService','CommTabService'];
})();