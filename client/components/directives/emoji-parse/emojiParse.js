/**
 * Created by hxl on 2015/10/28.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .directive('emojiParse', ['emojiParseService',fEmojiParse]);

    /**
     * emoji表情解析
     * @param emojiParseService
     * @returns {{restrict: string, scope: {etext: string}, link: Function}}
     */
    function fEmojiParse(emojiParseService) {
        return {
            restrict    :   'A',
            scope       : {
                etext    : '='//要解析的文本
            },
            link        : function(scope, element, attrs) {
                var _watch = scope.$watch('etext', function (newVal, oldVal) {
                    element.empty().append(emojiParseService.parse(newVal));
                    //_watch();
                });
            }
        };
    }
})();