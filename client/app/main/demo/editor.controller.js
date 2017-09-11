/**
 * Created by Administrator on 2016/1/13.
 */
;(function(){
    'use strict'
    angular.module('main.demo').
    controller('demoEditorControlller', fDemoEditorController);

    fDemoEditorController.$inject = ['$scope'];
    function fDemoEditorController($scope) {
        $scope.editor = {name:'is editor?'};
        $scope.getContent = function() {
            $scope.edit_content_str = $scope.editor.getContent();
            console.log('get editor content', $scope.edit_content_str);
        }

        $scope.setContent = function() {
            $scope.editor.setContent($scope.edit_content_str);
        }
        $scope.editor_content = '[{"type":2,"subType":[],"style":["font-size:14px","line-height:1.2","font-style:italic","text-align:right"],"content":{"con":"gggggxx"}}]';

        $scope.editor2 = angular.copy($scope.editor);
    }
})();