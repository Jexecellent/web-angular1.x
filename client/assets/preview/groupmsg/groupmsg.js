;(function() {
    'use strict';
    /**
     *  Module  previewApp
     *
     * 群发消息预览
     */
    angular.module('previewApp', [])
    .controller('GroupmsgDetailCtrl', GroupmsgDetailCtrl);

    function GroupmsgDetailCtrl($scope) {

       
        $scope.groupmsg = store.get('preview_groupmsg');
        if(!angular.isUndefined($scope.groupmsg.createTime)){
          $scope.groupmsg.createTime=moment($scope.groupmsg.createTime).format('YYYY-MM-DD HH:mm');
        }
       
    }
})();