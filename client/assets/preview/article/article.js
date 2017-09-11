;(function() {
    'use strict';
    /**
     *  Module  previewApp
     *
     * 手记预览
     */
    angular.module('previewApp', [])
    .controller('NewsDetailCtrl', NewsDetailCtrl);

    function NewsDetailCtrl($scope) {
        $scope.article={};
       

        $scope.article = store.get('preview_article');
        if(!angular.isUndefined($scope.article.createTime)){
          $scope.article.createTime=moment($scope.article.createTime).format('YYYY-MM-DD HH:mm');
        }
       
    }
})();