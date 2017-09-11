/**
 * Created by Administrator on 2016/1/9.
 */
/**
 * Created by hxl on 2015/10/22.
 */
;(function () {
    'use strict'

    angular.module('main.pageshow', [])
        .config(fPageShowConfig);

    function fPageShowConfig($stateProvider) {
        $stateProvider.state('main.pageshow', {
            url: '/pageshow',
            views: {
                'view': {
                    templateUrl: 'app/main/pageShow/pages/index.html',
                    controller: 'StoreIndexController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/storeIndex/index.controller.js',
                        '/app/main/storeIndex/manage.controller.js',
                        '/app/main/storeIndex/storeIndex.service.js',
                        '/app/main/goodsType/goodsType.service.js']);
                }]
            }
        });
    }
})();