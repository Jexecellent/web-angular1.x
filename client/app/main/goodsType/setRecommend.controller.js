/**
 *  main.goodsType Module
 *
 * 设置推荐 Description
 */

;(function() {
  'use strict';
  angular.module('main.goodsType')
    .controller('SetRecommendController', SetRecommendController);

  function SetRecommendController($scope, vcModalService, CommRestService, TipService) {

    $scope.recommendList = [];

    //页面初始化
    $scope.init = function() {
      CommRestService.post('goods/recommendList', {
          pageSize: 10,
          pageNumber: 1
        },
        function(data) {
          if (data) {
            $scope.recommendList = data.content;
          }
        });
    };


    //添加推荐
    $scope.addRecommend = function(typeId) {
      vcModalService({
        retId: 'selectedLinkData',
        backdropCancel: false,
        title: '选择商品',
        css: {
          height: '500px',
          width: '600px'
        },
        templateUrl: 'app/templates/common/tplSelectGoods.html',
        controller: 'SelectGoodsController',
        success: {
          label: '确定',
          fn: function(goodInfo) {
            //如未返回商品id则认为没选择到商品,此时给予提示
            if (!goodInfo.goodsId) {
              window.vcAlert('请选择商品');
              return;
            }
            CommRestService.post('goods/recommendAdd', {
              goodsId: goodInfo.goodsId,
              typeId: typeId,
              type: 2
            }, function() {
              $scope.init();
            });
          }
        }
      });
    };

    //删除推荐
    $scope.deleteRecommend = function(good) {
      window.vcAlert({
        title: '删除推荐商品',
        text: '确认删除推荐商品吗?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function() {
        CommRestService.post('goods/recommendDel', {
          goodsId: good.id,
          type: 2
        }, function() {
          $scope.init();
        }, function(err) {
          TipService.add('error', err.msg, 3000);
        });
      });
    };
  }

  SetRecommendController.$inject = ['$scope', 'vcModalService', 'CommRestService', 'TipService'];
})();