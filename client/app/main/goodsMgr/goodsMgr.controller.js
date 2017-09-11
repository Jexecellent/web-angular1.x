/**
 * Created by wayky on 15/12/30.
 */
;(function() {
    'use strict';
    angular.module('main.goodsMgr')
        .controller('GoodsMgrController', GoodsMgrController);

    //首页
    function GoodsMgrController($scope, $timeout, GoodsTypeService, $stateParams, CommTabService) {
        $scope.loading = false;

        //0115 在父级取出基础数据,发布商品、商品列表取父级
        //GoodsTypeService.goodsTypeTrie(function(gt) {
        //    $scope.parentLevel = gt;
        //});
        //GoodsTypeService.getGoodsBrand(function(data) {
        //    $scope.brandList = data;
        //});

        var moduleId = $stateParams.moduleId || "manage";

        var targetTag = $stateParams.tag || moduleId;
        if (!!targetTag && targetTag !== "manage") {
            //只能延迟点处理
            $timeout(function() {
                CommTabService.next({
                    index: 2,
                    tag: 'manage',
                    root: 'goodsMgr'
                }, targetTag, {}, 'goodsMgr');
            }, 500);
        }
    }

    GoodsMgrController.$inject = ['$scope', '$timeout', 'GoodsTypeService', '$stateParams', 'CommTabService'];
})();