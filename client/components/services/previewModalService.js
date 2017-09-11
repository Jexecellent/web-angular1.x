/**
 * Created by hxl on 2015/12/1.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .factory('previewModalService', fPreviewModalService)
        .controller('previewModalController', fPreviewModalController);

    /**
     * 预览service
     * @param commonModalService
     * @returns {*}
     */
    function fPreviewModalService(commonModalService) {
        var _config = {
            controller  :   'previewModalController',
            templateUrl :   'app/templates/activity/preview_activity_dialog.html',
            container   :   'body'
        };
        return commonModalService(_config);
    }
    fPreviewModalService.$inject = ['commonModalService'];

    function fPreviewModalController($scope, previewModalService) {
        /**
         * 关闭modal
         */
        $scope.close = function() {
            previewModalService.deactivate();
        }
    }
    fPreviewModalController.$inect = ['$scope','previewModalService'];
})();