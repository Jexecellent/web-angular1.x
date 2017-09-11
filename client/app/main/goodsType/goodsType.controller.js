/**
 *  main.goodsType Module
 *
 * 商品分类 Description
 */

;(function() {
    'use strict';
    angular.module('main.goodsType')
        .controller('GoodsTypeController', GoodsTypeController);

    //首页
    function GoodsTypeController($scope) {
        $scope.loading = false;
    }

    GoodsTypeController.$inject=['$scope'];
})();