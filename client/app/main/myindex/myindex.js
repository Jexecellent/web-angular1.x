/**
 * Created by hxl on 2015/10/22.
 */
;(function () {
    'use strict'

    angular.module('main.myindex', [])
        .config(fMyIndexConfig);

    function fMyIndexConfig($stateProvider) {
        $stateProvider.state('main.myindex', {
            url: '/myindex',
            views: {
                'view': {
                    templateUrl: 'app/main/myindex/index.html',
                    controller: 'MyindexController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/myindex/myindex.controller.js']);
                }]
            }
        });
    }
})();