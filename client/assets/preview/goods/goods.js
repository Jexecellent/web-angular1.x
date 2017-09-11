;(function() {
  'use strict';
  /**
   *  Module  previewApp
   *
   * 商品预览
   */
  angular.module('previewApp', ['ngSanitize'])
    .controller('GoodsDetailCtrl', GoodsDetailCtrl);

  function GoodsDetailCtrl($scope) {

    $scope.goods = {};
    parseEditGoods(store.get('preview_goods'));

    function parseEditGoods(detail) {
      $scope.goods.name = detail.name;
      $scope.goods.commission = detail.commission;
      $scope.goods.detailinfo = detail.detailinfo;
      $scope.goods.realPrice = detail.realPrice;

      //商品展示图
      $scope.goods.ImgDetail = [];
      if (detail.images) {
        var imgs = JSON.parse(detail.images);
        _.each(imgs, function(i) {
          var o = {};
          o.img = i;
          $scope.goods.ImgDetail.push(o);
        });
      }
      //商品信息
      if (!_.isUndefined(detail.attributes)) {
        var attrObj = JSON.parse(detail.attributes);
        if (_.isObject(attrObj) && attrObj !== {}) {
          var attrs = _.pairs(attrObj);
          $scope.goods.attributes = [];
          for (var i = 0; i < attrs.length; i++) {

            var obj = {};
            if(attrs[i][0] !== ''){
              obj.name = attrs[i][0]+':';
            }
            if(attrs[i][1] !== ''){
              obj.value = attrs[i][1];
            }
            if(obj.name !==undefined || obj.value !== undefined){
              $scope.goods.attributes.push(obj);
            }
            
          }
        }
      }
      
      //售价 取所有规格中最小现价值
      if (!_.isUndefined(detail.skus)) {
        var skus = JSON.parse(detail.skus);
        var realPrices = [],
          _index = 0;
        _.map(skus.values, function(value) {
          realPrices.push(value.realPrice);
          _index++;
        });
        $scope.goods.realPrice = _.min(realPrices);
        
      }

    }
    var htmlDecode = function (str) {
      var div = document.createElement('div');
      div.innerHTML = str;
      var txt = div.innerText || div.textContent;
      div = null;
      return txt;
    };

    $scope.introDecoded = function(){
      if ($scope.goods.detailinfo) {
        return htmlDecode($scope.goods.detailinfo);
      }

      return $scope.goods.detailinfo;
    };

  }
})();