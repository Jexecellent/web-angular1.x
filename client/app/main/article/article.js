/**
 *  open.article Module
 *
 * 资讯管理 Description
 */

;
(function () {

    'use strict';

    angular.module('main.article', [])
        .config(fArticleConfig);

    function fArticleConfig($stateProvider) {
        $stateProvider
            .state('main.article', {
                url: '/article/{moduleId}?tab&tag',
                views: {
                    'view': {
                        templateUrl: 'app/main/article/index.html',
                        controller: 'ArticleController'
                    }
                },
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load(['app/main/article/article.controller.js',
                            'app/main/article/article.service.js']);
                    }]
                }
        });
    }
})();