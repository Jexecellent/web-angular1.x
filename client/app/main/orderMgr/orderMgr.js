/**
 * Created by dengshaoxiang on 16/01/04.
 */
;
(function () {
    'use strict'

    angular.module('main.orderMgr', [])
        .config(fOrderMgrConfig);

    function fOrderMgrConfig($stateProvider) {
        $stateProvider.state('main.orderMgr', {
            url: '/orderMgr',
            views: {
                'view': {
                    templateUrl: 'app/main/orderMgr/index.html',
                    controller: 'OrderMgrController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/orderMgr/orderMgr.controller.js']);
                }]
            }
        });
    }
})();