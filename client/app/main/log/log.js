/**
 * Created by hxl on 2016/1/7.
 * 从此代码无bug
 */
;(function(){
    'use strict'
    angular.module('main.log', [])
        .config(fLogConfig);

    function fLogConfig($stateProvider) {
        $stateProvider.state('main.log', {
            url: '/log',
            views: {
                'view': {
                    templateUrl: 'app/main/log/pages/index.html',
                    controller: 'logIndexController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/log/index.controller.js',
                        '/app/main/log/log.service.js']);
                }]
            }
        });
    }
})();