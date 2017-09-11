/**
 * Created by hxl on 2015/10/22.
 */
;
(function () {
    'use strict'

    angular.module('main.groupmsg', [])
        .config(fGroupMsgConfig);

    function fGroupMsgConfig($stateProvider) {
        $stateProvider.state('main.groupmsg', {
            url: '/groupmsg?tab&tag',
            views: {
                'view': {
                    templateUrl: 'app/main/groupmsg/index.html',
                    controller: 'GroupMsgController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/groupmsg/groupmsg.controller.js']);
                }]
            }
        });
    }
})();