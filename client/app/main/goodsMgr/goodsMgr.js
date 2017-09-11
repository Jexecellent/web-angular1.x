
/**
 *  open.goodsType Module
 *
 *  商品管理 Description
 */

;(function () {
    'use strict';

    angular.module('main.goodsMgr', [])
        .config(GoodsMgrConfig);

    function GoodsMgrConfig ($stateProvider) {
        $stateProvider
            .state('main.goodsMgr', {
                url: '/goodsMgr/{moduleId}?tag',
                views: {
                    'view': {
                        templateUrl: 'app/main/goodsMgr/index.html',
                        controller: 'GoodsMgrController'
                    }
                },
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'app/main/goodsMgr/goodsMgr.controller.js',
                            'app/main/goodsType/goodsType.service.js',
                            'app/main/goodsMgr/goodsManager.controller.js',
                            'app/main/goodsMgr/goodsRelease.controller.js']);
                    }]
                }
            });
    }
})();