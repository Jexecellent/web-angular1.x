;(function () {
    'use strict';
    angular.module('main.act')
        .controller('ActController', fActController)
        .controller('ActivityManagerController',fActivityManagerController);

    function fActController($scope, $stateParams, $timeout, CommTabService) {

        $scope.moduleId = parseInt($stateParams.moduleId) || 0;

        $scope.loading = false;

        var targetTab = $stateParams.tab;
        var targetTag = $stateParams.tag;

        if (!!targetTag) {
            if('banner' === targetTab) {
                $timeout(function(){
                    CommTabService.next({index:2, tag:'banner', root:'actTabs'}, 'banner', {}, 'actTabs');
                    $timeout(function(){
                        CommTabService.next({index:2, tag:targetTag, root:'commBannerTabs'}, targetTag, {}, 'commBannerTabs');
                    },500);
                }, 500);
            }else {
                //只能延迟点处理
                $timeout(function(){
                    CommTabService.next({index:2, tag:'manager', root:'actTabs'}, targetTag, {}, targetTab);
                }, 500);
            }
        }
    }

    /**
     * 活动管理ctrl
     * @param $scope
     */
    function fActivityManagerController($scope) {

        $scope.loading = false;
    }
    fActivityManagerController.$inject = ['$scope'];
})();
