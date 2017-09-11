/**
 * Created by dengshaoxiang on 15/12/31.
 */
;
(function () {
    'use strict'

    angular.module('main.storeDistribute', [])
        .config(fStoreDistributeConfig);

    function fStoreDistributeConfig($stateProvider) {
        $stateProvider.state('main.storeDistribute', {
            url: '/storeDistribute',
            views: {
                'view': {
                    templateUrl: 'app/main/storeDistribute/index.html',
                    controller: 'StoreDistributeController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/storeDistribute/storeDistribute.controller.js']);
                }]
            }
        });
    }
})();