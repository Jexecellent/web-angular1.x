;(function() {
  'use strict';
  /**
   *  Module  previewApp
   *
   * banner预览
   */
  angular.module('previewApp', [])
    .controller('BannerDetailCtrl', BannerDetailCtrl);

  function BannerDetailCtrl($scope) {

    $scope.banner = store.get('preview_banner');
   

    //如是从审核表过来
    if (!angular.isUndefined($scope.banner.moduleType)) {

      $scope.banner.content = $scope.banner;
      var type = '';
      switch ($scope.banner.moduleType) {
        case 3:
          type = '资讯';
          break;
        case 4:
          type = '活动';
          break;
        case 5:
          type = '手记';
          break;
        case 7:
          type = '约伴';
          break;
        default:
          break;
      }
      $scope.banner.type = type;
    } else {
      $scope.banner.content = $scope.banner.content;
    }
  }
})();