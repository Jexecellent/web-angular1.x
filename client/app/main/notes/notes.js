/**
 *  open.notes Module
 *
 *  手记管理 Description
 */

;(function () {
  'use strict';

angular.module('main.notes', [])
  .config(NotesConfig);

  function NotesConfig ($stateProvider) {
    $stateProvider  
      .state('main.notes', {
        url: '/notes/{moduleId}?tab&tag',
        views: {
          'view': {
              templateUrl: 'app/main/notes/index.html',
              controller: 'NotesController'
          }
        },  
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load([
              'app/main/notes/notes.controller.js',
              'app/main/notes/notes.service.js']);
          }]
        }      
      });
  }
})();