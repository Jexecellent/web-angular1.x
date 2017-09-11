/**
 * Created by Administrator on 2016/1/15.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .directive('openEditor', fOpenEditor);

    function fOpenEditor() {

        return {
            restrict    :   'AE',
            require :   'ngModel',
            scope   :   {
                editor  :   '='
            },
            templateUrl :   'components/directives/open-editor/open-editor.html',
            controller  :   'editorController',
            controllerAs    :   'myEd',
            link    :   function(scope, ele, attrs, ngModelCtrl){
                /*
                scope.name = 'open-editor-name';
                scope.setContent = function(text){
                    ngModelCtrl.$setViewValue(text);
                    if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                        scope.$digest();
                    }
                }
                */
                ngModelCtrl.$render = function() {
                    if(ngModelCtrl.$viewValue){
                        console.log('$render editor ngModel value:',ngModelCtrl.$viewValue);
                        if(typeof scope.editor.setContent === 'function') {
                            scope.editor.setContent(ngModelCtrl.$viewValue);
                        }
                    }
                }
                $(".fullScreen_btn").on("click", function() {
                    $(".vc_editor_box").toggleClass("open");
                    $(".fullScreen_btn").toggleClass("open");
                    if($(".fullScreen_btn").hasClass("open")) {
                        $(".page_content").css({'z-index':99});
                    }else {
                        $(".page_content").css({'z-index':11});
                    }
                });
            }
        };
    }
})();