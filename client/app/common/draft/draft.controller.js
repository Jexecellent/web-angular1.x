/**
 * Created by wayky on 15/11/13.
 */
;(function() {
  'use strict';

  var app = angular.module('open.common');

  app.controller('DraftController', ['$scope', 'CommTabService', 'AuditService', 'AuthService', 'TipService', function ($scope, CommTabService, AuditService, AuthService, TipService) {

    //审核子类型，由实际业务注入过来
    //关联表审核(1：资讯、2：栏目、3：banner、4：活动、5：手记、6：群发消息）
    $scope.bizType = 0;

    //业务类型对应实体业务类型，由实际业务注入过来
    $scope.moduleType = 0;

    //业务类型对应实体Id，由实际业务注入过来
    $scope.moduleId = 0;

    //重新编辑的TabIndex，由实际业务注入过来, 默认为第一个Tab
    $scope.editTabIndex = 1;

    //编辑，查看详情可能需要到上一级的Tab
    var parentTabRoot = null;

    //查询参数
    $scope.params = {
      auditTypes: 0,
      auditStatuses: 0,
      pageSize: 10,
      pageNumber: 0
    };

    //数据
    $scope.data = [];
    //分页
    $scope.pager = {};

    $scope.loadData = function (pageNo) {
      this.params.pageNumber = 0;
      $scope.$parent.loading = true;
      pageNo ? (this.params.pageNumber = parseInt(pageNo)) : this.params.pageNumber++;
      //init
      if (!this.params.bizType && this.bizType) {
        this.params.bizType = this.bizType;
      }
      if (!this.params.moduleType && this.moduleType) {
        this.params.moduleType = this.moduleType;
      }
      if (!this.params.moduleId && this.moduleId) {
        this.params.moduleId = this.moduleId;
      }
      this.params.applyRid = AuthService.getUserInfo().rid || 0; //只能查看自己的草稿
      search();
    };

    function search() {
      AuditService.getList($scope.params, function (data) {
        $scope.$parent.loading = false;
        if (data.content) {
          $scope.data = data.content;
          $scope.pager = {
            firstPage: data.firstPage,
            lastPage: data.lastPage,
            totalPages: data.totalPages,
            pageNumber: data.pageNumber
          };
        }
      });
    }

    //检查页面参数是否合法
    function pageValidate() {
      return !(!$scope.bizType || !$scope.editTabIndex || ($scope.bizType == 3 && !$scope.moduleId));
    }

    //供Tab调用的页面刷新接口
    $scope.vcTabOnload = function (query, from) {

      if ($scope.$dirty) {
        if (pageValidate()) {
          if (parentTabRoot == null) {
              parentTabRoot = !$scope.$vcTabInfo.parent ? $scope.$vcTabInfo.root : $scope.$vcTabInfo.parent.root;
          }
          $scope.loadData();
        }
        else {
          TipService.add("warning", "草稿Tab(" + JSON.stringify($scope.$vcTabInfo) + ")初始化参数无效", 3000);
        }
        $scope.$dirty = false;
      }
    };

    //页面操作
    //跳去业务的修改
    $scope.edit = function (draft) {
      CommTabService.next($scope.$vcTabInfo, $scope.editTabIndex, {
        operate: 'editDraft',
        dataId: draft.id
      }, parentTabRoot);
    };

    //直接删除
    $scope.del = function (draft) {
      window.vcAlert({
        title: '提示',
        text: '你确定要删除这条草稿吗？',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function () {
        //确定删除
        $scope.$parent.loading = true;
        AuditService.deleteAudit({
          auditId: draft.id
        }, function () {
          $scope.$parent.loading = false;
          //$scope.vcTabReload({from:'deleteDraft'});
          $scope.$dirty = true;
          $scope.vcTabOnload({from: 'deleteDraft'});
          TipService.add('success', '删除成功', 3000);
        });
      }, function (err) {
        $scope.$parent.loading = false;
        TipService.add('danger', err.msg, 3000);
      });
    };

  }]);
})();

