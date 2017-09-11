/**
 * Created by hxl on 2015/10/22.
 */
;(function () {
    'use strict'

    angular.module('main.storeIndex', [])
        .constant('INDEX_COMPONENT_TYPES', {
            SWIPER_BANNER : 1,
            TOW_COLUMN : 8,
            STORE_WATERFALL : 9
        })
        .config(fStoreIndexConfig);

    function fStoreIndexConfig($stateProvider) {
        $stateProvider.state('main.storeIndex', {
            url: '/storeIndex',
            views: {
                'view': {
                    templateUrl: 'app/main/storeIndex/index.html',
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