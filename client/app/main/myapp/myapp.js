/**
 * Created by wayky on 15/10/21.
 */
;(function(){
    'use strict';
    angular.module('main.myapp', [])
        .config(MyAppConfig);

    function MyAppConfig($stateProvider) {
        $stateProvider.state('main.myapp', {
            url: '/myapp',
            views: {
                'view': {
                    templateUrl: 'app/main/myapp/index.html',
                    controller: 'MyAppController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['app/main/myapp/myapp.controller.js']);
                }]
            }
        });
    }
})();