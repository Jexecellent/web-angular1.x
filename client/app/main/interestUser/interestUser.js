/**
 *  main.interestUser Module
 *
 * 用户管理 Description
 */

;(function () {
  'use strict';

angular.module('main.interestUser', [])
  .config(InterestUserConfig);

  function InterestUserConfig ($stateProvider) {
    $stateProvider  
      .state('main.interestUser', {
        url: '/interestUser',
        views: {
          'view': {
              templateUrl: 'app/main/interestUser/index.html',
              controller: 'InterestUserController'
          }
        },  
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(['app/main/interestUser/interestUser.controller.js']);
          }]
        }      
      });
  }
  
})();