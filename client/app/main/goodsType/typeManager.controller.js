/**
 *  main.goodsType Module
 *
 *  分类管理 Description
 */

;
(function() {
  'use strict';
  angular.module('main.goodsType')
    .controller('TypeManagerController', TypeManagerController);

  function TypeManagerController($scope, vcModalService, CommRestService, TipService, GoodsTypeService) {

    $scope.levelNode = [];
    $scope.childLevel = [];

    $scope.selectedGoodTypeId = 0; //选中的一级分类typeId

    //加载数据
    $scope.loadData = function() {
      $scope.$parent.loading = true;
      CommRestService.post('goods/typeList', {}, function(data) {

        if (data) {
          store.set('goodsType', data);
          GoodsTypeService.goodsTypeTrie(function(res) {
            $scope.levelNode = res;
          });
          //如当前操作的是二级分类，刷新二级分类数据
          if (level === '二级分类') {
            $scope.childLevel = GoodsTypeService.getChildLevel($scope.levelNode, $scope.selectedGoodTypeId);
          }
        }
        $scope.$parent.loading = false;
      });
    };



    //打开添加/编辑(一二级)分类弹窗
    var level = '',
      levelTitle = '',
      levelType = ''; //分类操作类型
    $scope.openEditLevel = function(type, edit) {
      if (type === 'second' && $scope.current !== 'current') {
        return;
      }
      type === 'first' ? level = '一级分类' : level = '二级分类';

      if (edit !== undefined) {
        $scope.currentLevel = edit;
        levelType = 'Update';
        levelTitle = '修改' + level;
      } else {
        $scope.currentLevel = {};
        levelType = 'Add';
        levelTitle = '添加' + level;
      }
      vcModalService({
        retId: 'currentLevel',
        backdropCancel: false,
        title: levelTitle,
        css: {
          height: '150px',
          width: '300px'
        },
        templateUrl: 'app/main/goodsType/pages/type_edit.html',
        controller: 'TypeManagerController',
        success: {
          label: '确定',
          fn: sureEdit
        }
      }, {
        currentLevel: $scope.currentLevel
      });
    };

    //确认添加分类
    function sureEdit(res) {
      var editData = {
        typeId: res.typeId,
        name: res.name
      };

      if (levelType === 'Add') {
        switch (level) {
          case '一级分类':
            editData.isRoot = true;
            break;
          case '二级分类':
            editData.isRoot = false;
            editData.parentId = $scope.selectedGoodTypeId;
            break;
        }

      } else {
        editData.id = res.id;
      }

      if (res.name === '' || res.name === undefined) {
        TipService.add('warning', '分类名称不能为空', 3000);
        return false;
      } else {
        var msg = '';
        switch (levelType + level) {
          case 'Add一级分类':
            msg = '一级分类新增成功';
            break;
          case 'Add二级分类':
            msg = '二级分类新增成功';
            break;
          case 'Update一级分类':
            msg = '一级分类修改成功';
            break;
          case 'Update二级分类':
            msg = '二级分类修改成功';
            break;
          default:
        }

        CommRestService.post('goods/type' + levelType, editData, function(data) {
          TipService.add('success', msg, 3000);
          $scope.loadData();
        });
        return true;
      }
    }

    //打开删除(一二级)分类弹窗
    $scope.openDelLevel = function(type, del) {
      type === 'first' ? levelTitle = '一级分类' : levelTitle = '二级分类';
      level = levelTitle;
      window.vcAlert({
        title: '删除' + levelTitle,
        text: '确认删除' + levelTitle + '吗?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function() {
        CommRestService.post('goods/typeDel', {
          typeId: del
        }, function(data) {
          TipService.add('success', '删除成功', 3000);
          $scope.loadData();
        }, function(err) {
          TipService.add('error', err.msg, 3000);
        });
      });
    };

    //选中一级分类事件(二级分类置为可用状态)

    $scope.checkedFirstLevel = function(level) {
      $scope.selectedGoodTypeId = level.typeId;
      //选中时加载一级对应下的所有二级
      if ($scope.selectedGoodTypeId !== 0) {
        $scope.current = 'current';
        $scope.childLevel = GoodsTypeService.getChildLevel($scope.levelNode, level.id);
      }
    };

  }


  TypeManagerController.$inject = ['$scope', 'vcModalService', 'CommRestService', 'TipService', 'GoodsTypeService'];

})();