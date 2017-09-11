/**
 * Created by wayky on 15/10/21.
 */
;(function() {
    'use strict';
    angular.module('main.home', [])
        .config(UserHomeConfig);

    function UserHomeConfig($stateProvider) {
        $stateProvider.state('main.home', {
            url: '/home',
            views: {
                'view': {
                    templateUrl: 'app/main/home/index.html',
                    controller: 'UserHomeController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['app/main/home/home.controller.js']);
                }]
            }
        });
    }
})();