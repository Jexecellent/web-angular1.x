/**
 *  open.interestUser Module
 *
 * 用户管理 Description
 */

;(function () {
  'use strict';

angular.module('main.user', [])
  .config(userConfig);

  function userConfig ($stateProvider) {
    $stateProvider  
      .state('main.user', {
        url: '/user?tab&tag',
        views: {
          'view': {
              templateUrl: 'app/main/user/index.html',
              controller: 'UserController'
          }
        },  
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['app/main/user/user.controller.js']);
          }]
        }      
      });
  }
  
})();