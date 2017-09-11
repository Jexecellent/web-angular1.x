/**
 *  demo Module
 *
 *  公共组件演示
 */

;(function () {
  
'use strict';

angular.module('main.demo',[])
  .config(fDemoConfig);

  function fDemoConfig($stateProvider) {
     // ngModalDefaultsProvider.set({
     //        closeButtonHtml: "<i class='fa fa-times'></i>"
     //      });

    $stateProvider
      
      //list
      .state('main.demo', {
        url: '/demo?tab&tag',
        views: {
          'view': {
              templateUrl: 'app/main/demo/demo.html',
              controller: 'DemoController'
          }
        },  
        resolve: { 
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load([
              'app/main/demo/demo.controller.js',
              'app/main/goodsType/goodsType.service.js',
              'app/main/demo/editor.controller.js']);
          }]
        }      
      });
  }
})();