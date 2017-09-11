/**
 *  main.goodsType Module
 *
 * 品牌管理 Description
 */

;(function() {
  'use strict';
  angular.module('main.goodsType')
    .controller('BrandManagerController', BrandManagerController);

  function BrandManagerController($scope, vcModalService, CommRestService, TipService) {

    $scope.brandList = [];
    $scope.pager = {};
    var uploader = null;

    //加载数据
    $scope.loadData = function() {
      $scope.$parent.loading = true;
      CommRestService.post('goods/brandList', {}, function(data) {
        if (data) {
          $scope.brandList = data;
          store.set('goodsBrand', data);
        }
        $scope.$parent.loading = false;
      }, function(err) {
        TipService.add('error', err.msg, 3000);
        $scope.$parent.loading = false;
        $scope.brandList = [];
        $scope.pager = {};
      });
      initUpload();
    };

    //添加品牌
    $scope.addBrand = function() {
      vcModalService({
        retId: 'currentBrand',
        backdropCancel: false,
        title: '添加品牌',
        css: {
          height: '150px',
          width: '300px'
        },
        templateUrl: 'app/main/goodsType/pages/type_edit.html',
        controller: 'BrandManagerController',
        success: {
          label: '确定',
          fn: sureEdit
        }
      }, {
        currentBrand: $scope.currentBrand || {}
      });
    };

    //确认添加
    function sureEdit(res) {
      if (res.name === '' || res.name === undefined) {
        TipService.add('warning', '品牌名称不能为空', 3000);
        return false;
      } else {
        CommRestService.post('goods/brandAdd', res, function() {
          TipService.add('success', '品牌新增成功', 3000);
          $scope.loadData();
        }, function(res) {
          TipService.add('error', res.msg, 3000);
        });
        return true;
      }
    }

    //删除单个品牌对象的封面图
    $scope.removeImg = function(brand) {
      window.vcAlert({
        title: '删除该品牌的封面图',
        text: '确认删除该品牌的封面图吗?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function() {
        CommRestService.post('goods/brandUpdate', {
          shopBrandId: brand.id,
          name: brand.name //0115 删除图片时无需传image字段
        }, function() {
          TipService.add('success', '封面图删除成功', 3000);
          $scope.loadData();
        }, function(err) {
          TipService.add('error', err.msg, 3000);
        });
      });
    };

    $scope.del = function(id) {
      window.vcAlert({
        title: '删除品牌',
        text: '确认删除此品牌吗?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function() {
        CommRestService.post('goods/brandDel', {
          shopBrandId: id
        }, function() {
          TipService.add('success', '删除成功', 3000);
          $scope.loadData();
        }, function(err) {
          TipService.add('error', err.msg, 3000);
        });
      });
    };

    //添加品牌封面图
    $scope.fileClick = function(curr) {
      $scope.currBrand = curr; //当前添加图片所在的实例
      angular.element('.webuploader-element-invisible').click();
      return true;
    };

    function initUpload() {
      if (uploader === null) {
        uploader = WebUploader.create({
          auto: true,
          swf: 'http://imgcache.varicom.im/js/webupload/Uploader.swf',
          server: '/api/base/fileupload',
          pick: '#brandImg',
          resize: false,
          fileSizeLimit: 2048000,
          accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
          }
        });
        uploader.on('uploadSuccess', uploadSuccess);
        uploader.on('uploadComplete', uploadComplete);
        uploader.on('error', uploadError);
      }

      //上传成功后
      function uploadSuccess(file, response) {
        if (response && response.code === 0) {
          $scope.$apply(function() {
            CommRestService.post('goods/brandUpdate', {
              shopBrandId: $scope.currBrand.id,
              name: $scope.currBrand.name,
              image: response.t
            }, function() {
              TipService.add('success', '品牌修改成功', 3000);
              $scope.loadData();
            }, function(res) {
              window.vcAlert(res.msg);
            });
          });
        }
      }

      //当图片validate不通过时
      function uploadError(handler) {
        console.log(handler);
        $scope.$parent.loading = false;
        if (handler === 'Q_EXCEED_SIZE_LIMIT') {
          window.vcAlert('图片大小已超过2M，请重新上传');
        }
        if (handler === 'Q_TYPE_DENIED') {
          window.vcAlert('图片类型无效，请重新上传');
        }
      }

      //重置状态(可重复上传已在队列中的图片)
      function uploadComplete() {
        this.reset();
      }
    }
  }

  BrandManagerController.$inject = ['$scope', 'vcModalService', 'CommRestService', 'TipService'];
})();