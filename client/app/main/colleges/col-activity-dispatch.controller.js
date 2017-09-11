/**
 * Created by hxl on 2015/12/21.
 */
;(function(){
    'use strict'
    angular.module('main.college')
        .controller('colActivityDispatchController',fColActivityDispatchController)
        .controller('colActivityManageController',fColActivityManageController);

    /**
     * 分发控制器
     */
    function fColActivityDispatchController($scope, $stateParams, $timeout, CommTabService) {
        $scope.moduleId = parseInt($stateParams.moduleId) || 0;

        $scope.loading = false;

        var targetTab = $stateParams.tab;
        var targetTag = $stateParams.tag;
        if(!!targetTag) {
            if('banner' === targetTab) {
                $timeout(function(){
                    CommTabService.next({index:2, tag:'banner', root:'col_actTabs'}, 'banner', {}, 'col_actTabs');
                    $timeout(function(){
                        CommTabService.next({index:2, tag:targetTag, root:'commBannerTabs'}, targetTag, {}, 'commBannerTabs');
                    },500);
                }, 500);
            }else {
                $timeout(function(){
                    CommTabService.next({index:2, tag:'manage', root:'col_actTabs'}, targetTag, {}, targetTab);
                }, 500);
            }
        }
    }
    fColActivityDispatchController.$inject = ['$scope', '$stateParams', '$timeout', 'CommTabService'];

    function fColActivityManageController() {

    }
})();