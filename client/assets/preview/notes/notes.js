;(function() {
    'use strict';
    /**
     *  Module  previewApp
     *
     * 手记预览
     */
    angular.module('previewApp', ['ngSanitize'])
    .controller('NoteDetailCtrl', NoteDetailCtrl);

    function NoteDetailCtrl($scope) {

        
        $scope.note = store.get('preview_notes');
        if(!angular.isUndefined($scope.note.createTime)){
          $scope.note.createTime=moment($scope.note.createTime).format('YYYY-MM-DD HH:mm');
        }
       
    }
})();