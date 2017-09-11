/**
 * Created by hxl on 2015/10/27.
 */
;(function(){
    'use strict';
    angular.module('main.mate',[])
        .config(fMateConfig);
    function fMateConfig($stateProvider) {
        $stateProvider
            .state('main.mate', {
                url: '/mates/{moduleId}?tab&tag',
                views: {
                    'view': {
                        templateUrl: 'app/main/mate/index.html',
                        controller: 'MateController'
                    }
                },
                resolve: {
                    loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load(['app/main/mate/mate.controller.js',
                            'app/main/mate/mate.service.js'
                        ]);
                    }]
                }
            });
            
    }
})();