/**
 *  open.goodsType Module
 *
 *  商品分类 Description
 */

;(function () {
    'use strict';

    angular.module('main.goodsType', [])
        .config(GoodsTypeConfig);

    function GoodsTypeConfig ($stateProvider) {
        $stateProvider
            .state('main.goodsType', {
                url: '/goodsType',
                views: {
                    'view': {
                        templateUrl: 'app/main/goodsType/index.html',
                        controller: 'GoodsTypeController'
                    }
                },
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'app/main/goodsType/goodsType.controller.js',
                            'app/main/goodsType/goodsType.service.js',
                            'app/main/goodsType/typeManager.controller.js',
                            'app/main/goodsType/setRecommend.controller.js',
                            'app/main/goodsType/brandManager.controller.js',
                            'app/main/goodsType/specManager.controller.js']);
                    }]
                }
            });
    }
})();