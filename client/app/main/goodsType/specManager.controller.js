/**
 *  main.goodsType Module
 *
 * 规格管理 Description
 */

;(function() {
  'use strict';
  angular.module('main.goodsType')
    .controller('SpecManagerController', SpecManagerController);

  function SpecManagerController($scope, vcModalService, CommRestService, TipService) {

    $scope.specList = []; //规格列表
    $scope.typeList = [{ //规格类型下拉值
      id: 1,
      name: '数值'
    }, {
      id: 2,
      name: '价格'
    }, {
      id: 3,
      name: '文本'
    }];
    //加载数据
    $scope.loadData = function() {
      $scope.$parent.loading = true;
      CommRestService.post('goods/specificationList', {}, function(data) {
        if (data) {
          $scope.specList = data;
          store.set('goodsSpec', data);
        }
        $scope.$parent.loading = false;
      }, function(err) {
        window.vcAlert(err.msg);
        $scope.$parent.loading = false;
      });
    };

    //打开添加/修改规格弹窗
    var specType = '',
      title = '';
    $scope.openEditSpec = function(type, edit) {
      specType = type; //0115 记录当前操作类型
      if (edit !== undefined && type === 'update') {
        $scope.editSpec = edit;
        title = '修改规格';
      } else {
        $scope.editSpec = {};
        title = '添加规格';
      }
      vcModalService({
        retId: 'editSpec',
        backdropCancel: false,
        title: title,
        css: {
          height: '350px',
          width: '300px'
        },
        templateUrl: 'app/main/goodsType/pages/spec_edit.html',
        controller: 'SpecManagerController',
        success: {
          label: '确定',
          fn: sureEdit
        }
      }, {
        editSpec: $scope.editSpec
      });

    };

    //确认添加/修改规格
    function sureEdit(res) {
      var editData = {
        name: res.name,
        type: 3, //默认文本，res.type,
        remark: res.remark
      };
      //0115 修改时传入id
      if (specType === 'update') {
        editData.goodsSpecificationId = res.id;
      }
      if (res.name === '' || res.name === undefined) {
        TipService.add('warning', '规格名称不能为空', 3000);
        return false;
      } else {
        var msg = '';
        specType === 'add' ? msg = '规格新增成功' : msg = '规格修改成功';

        CommRestService.post('goods/specification' + specType, editData, function() {
          TipService.add('success', msg, 3000);
          $scope.loadData();
        }, function(res) {
          TipService.add('error', res.msg, 3000);
        });
        return true;
      }
    }

    //删除规格
    $scope.del = function(del) {
      window.vcAlert({
        title: '删除规格',
        text: '确认删除此规格吗?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function() {
        CommRestService.post('goods/specificationDel', {
          typeId: del
        }, function() {
          TipService.add('success', '删除成功', 3000);
          $scope.loadData();
        }, function(err) {
          TipService.add('error', err.msg, 3000);
        });
      });
    };
  }

  SpecManagerController.$inject = ['$scope', 'vcModalService', 'CommRestService', 'TipService'];
})();