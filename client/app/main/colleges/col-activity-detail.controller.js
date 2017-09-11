/**
 * Created by hxl on 2015/12/23.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .controller('colActivityDetailController',fColActivityDetailController);

    /**
     * 高校活动详情ctrl
     * @param $scope
     */
    function fColActivityDetailController($scope,colActivityServices,CacheService,CommTabService,vcModalService,
                                          TipService) {
        $scope.vcTabOnload = function(data, lastTabInfo) {
            $scope.pms = colActivityServices.permission;
            //每次进入都重新加载
            if ($("#act_preview_ifram").length == 0){
                //load iframe
                $("#preview_div").html('<iframe id="act_preview_ifram" width="100%" height="100%"></iframe>');
            }
            if(data && data.actId) {
                getActivityInfo(data.actId);
            }
            try {
                var _height = angular.element(".act_tab_body").children().first().height();
                angular.element(".act_detail_body").css({'height':_height});
            }catch(err){}
        }
        function getActivityInfo(actId) {
            colActivityServices.get({activityId:actId},function(actInfo) {
                $scope._cur_act_detail = actInfo;
                if(actInfo.activityInfo && actInfo.activityInfo.unionInfo){//联盟信息
                    $scope._cur_act_union = JSON.parse(actInfo.activityInfo.unionInfo);
                }else {
                    $scope._cur_act_union = null;
                }
                if(actInfo.activityInfo && actInfo.activityInfo.consultInfo) {
                    $scope._cur_act_consults = JSON.parse(actInfo.activityInfo.consultInfo);
                }else {
                    $scope._cur_act_consults = null;
                }
                $scope._cur_act_union_type = '拼车';
                if($scope._cur_act_detail.activityInfo.unionType === 1) {
                    $scope._cur_act_union_type = '返点';
                }
                CacheService.putObject('preview_activity', actInfo.activityInfo);

                var previewUrl = '/assets/preview/activity/index.html?r=' + Math.random();
                $("#act_preview_ifram").attr('src', previewUrl);
            });
        }
        //活动详情返回
        $scope.goBackFromDetail = function(){
            CommTabService.next($scope.$vcTabInfo, 'online', {},['online']);
        };
        /**
         * 下线活动
         * @param act
         */
        $scope.activityOffline = function() {
            vcModalService({
                title:'提示',
                template:'<p style="text-align: center;">确定下线此活动？</p>',
                success:{label:'确定',fn:offlineAction}
            });
        }
        function offlineAction() {
            colActivityServices.offline({activityId:$scope._cur_act_detail.activityInfo.id},function(){
                $scope.goBackFromDetail();
                TipService.add('success','活动下线成功',3000);
            });
        }
        $scope.toEdit = function(act) {
            CommTabService.next($scope.$vcTabInfo,'col-act-tab-add',{
                op_type : 1,
                dataId  : $scope._cur_act_detail.activityInfo.id
            },'col_actTabs',[]);
        }
        /**
         * 名单管理
         */
        $scope.activityJoin = function(act) {
            CommTabService.next($scope.$vcTabInfo, 'act_join_list', {act:act});
        }
    }
    fColActivityDetailController.$inject = ['$scope','colActivityServices','CacheService','CommTabService',
    'vcModalService','TipService'];
})();