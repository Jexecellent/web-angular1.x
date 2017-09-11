/**
 * Created by hxl on 2015/12/21.
 */
;
(function () {
    'use strict'
    angular.module('main.college', [])
        .config(fCollegesActivityConf);

    function fCollegesActivityConf($stateProvider) {
        $stateProvider.state('main.college', {
            url: '/col_activity/{moduleId}?tab&tag',
            views: {
                'view': {
                    templateUrl: 'app/main/colleges/pages/index.html',
                    controller: 'colActivityDispatchController'
                }
            },
            resolve: {
                loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['/app/main/colleges/col-activity-dispatch.controller.js',
                        '/app/main/colleges/col-activity.service.js',
                        '/app/main/colleges/col-activity-list.controller.js',
                        '/app/main/colleges/col-activity-release.controller.js',
                        '/app/main/colleges/col-activity-detail.controller.js',
                        '/app/main/colleges/col-activity-join_list.controller.js',
                        '/app/main/colleges/col-activity-offline.controller.js']);
                }]
            }
        });
    }

    fCollegesActivityConf.$inject = ['$stateProvider'];
})();