/**
 *  open.activity Module
 *
 *  活动 Description
 */
(function () {
    'use strict';
    angular.module('main.act', [])
        .config(fActConfig);

    function fActConfig($stateProvider) {
        $stateProvider.state('main.act', {
            url: '/act/{moduleId}?tab&tag',
            views: {
                'view': {
                    templateUrl: 'app/main/act/index.html',
                    controller: 'ActController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/act/act.controller.js',
                        '/app/main/act/actRelease.controller.js',
                        '/app/main/act/activity-list.controller.js',
                        '/app/main/act/activity-union.controller.js',
                        '/app/main/act/activity-offline.controller.js',
                        '/app/main/act/activity.service.js',
                        '/app/main/act/activity.filter.js',
                        '/app/main/act/activityRelease.service.js']);
                }]
            }
        });
    }
})();