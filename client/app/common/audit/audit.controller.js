/**
 * Created by wayky on 15/11/13.
 */
;(function() {
  'use strict';

  var app = angular.module('open.common');

  app.controller('AuditController', ['$scope', 'CommTabService', 'AuditService', 'vcModalService', 'TipService', 'previewModalService', '$filter', 'CacheService', 'CommRestService', function ($scope, CommTabService, AuditService, vcModalService, TipService, previewModalService, $filter, CacheService, CommRestService) {

    //审核子类型，由实际业务注入过来
    //关联表审核(1：栏目、2：banner、3：资讯、4：活动、5：手记、6：群发消息、7：相约、8：高校活动）
    $scope.bizType = 0;

    //业务类型对应实体业务类型，由实际业务注入过来
    $scope.moduleType = 0;

    //业务类型对应实体Id，由实际业务注入过来
    $scope.moduleId = 0;

    //审核类型，由实际业务注入过来
    //类型( 0、草稿 1、上线审核 2、线上修改审核 3、下线审核)
    $scope.auditTypes = '1,2,3'; //默认

    //审核结果(0：草稿、1：待审核、2：不通过、3：通过、4：删除
    $scope.auditStatuses = '1,2,3'; //默认

    //重新编辑的TabIndex，由实际业务注入过来, 默认为第一个Tab
    $scope.editTabIndex = 1;

    //当前用户的角色ID，由实际业务注入过来
    $scope.applyRid = 0;

    //编辑，查看详情可能需要到上一级的Tab
    var parentTabRoot = null;

    //查询参数
    $scope.params = {
      pageSize: 10,
      pageNumber: 0
    };

    //数据
    $scope.data = [];

    //分页
    $scope.pager = {};

    //检查页面参数是否合法
    function pageValidate() {
      return !(!$scope.bizType || !$scope.editTabIndex || (($scope.bizType == 2 || $scope.bizType == 3) && !$scope.moduleId));
    }

    //加载数据
    $scope.loadPage = function (pageNo) {
      pageNo ? (this.params.pageNumber = parseInt(pageNo)) : (this.params.pageNumber !== 0 ? this.params.pageNumber : this.params.pageNumber++);
      getData();
    };

    //搜索
    $scope.search = function(){
      $scope.loadPage(1);
    };

    function getData() {
      $scope.$parent.loading = true;
      AuditService.getList($scope.params, function (data) {
        if (data.content) {
          $scope.data = data.content;
          $scope.pager = {
            firstPage: data.firstPage,
            lastPage: data.lastPage,
            totalPages: data.totalPages,
            pageNumber: data.pageNumber
          };
        }
        $scope.$parent.loading = false;
      });
    }

    //供Tab调用的页面刷新接口
    $scope.vcTabOnload = function (query, from) {
      if ($scope.$dirty) {
        //先检查传入参数是否合法
        if (pageValidate()) {
          //init
          $scope.params.bizType = $scope.bizType;
          $scope.params.auditTypes = $scope.auditTypes;
          $scope.params.auditStatuses = $scope.auditStatuses;
          if ($scope.moduleId) {
            $scope.params.moduleId = $scope.moduleId;
          }
          //查询本人或全部的
          if ($scope.applyRid > 0) {
            $scope.params.applyRid = $scope.applyRid;
          }

          if ($scope.$vcTabInfo.root === "commBannerTabs") {
            //坑：Banner的编辑是在自己的tabs内
            parentTabRoot = "commBannerTabs";
          }
          else {
            parentTabRoot = !$scope.$vcTabInfo.parent ? $scope.$vcTabInfo.root : $scope.$vcTabInfo.parent.root;
          }

          $scope.loadPage();
        } else {
          TipService.add("warning", "审核Tab(" + JSON.stringify($scope.$vcTabInfo) + ")初始化参数无效", 3000);
        }
        $scope.$dirty = false;
      }
    };

    //业务操作
    //编辑
    $scope.edit = function (audit) {
      CommTabService.next($scope.$vcTabInfo, $scope.editTabIndex, {
        operate: 'editAudit',
        dataId: audit.id,
        bizType: $scope.bizType,
        bizId: audit.bizId
      }, parentTabRoot);
    };

    function previewLink(bizApi, content) {
      CacheService.putObject('preview_' + bizApi, content);
      var curTime = new Date().getTime();
      previewModalService.activate({
        f_src: '/assets/preview/' + bizApi + '/index.html?r=' + curTime
      });
    }

    //详情
    $scope.detail = function (audit, appname) {
      AuditService.getAudit({
        auditId: audit.id
      }, function (data) {

        var content = JSON.parse(data.content);
        var bizApi = $filter('bizTypeAPI')(audit.bizType);

        //banner app世界
        if (!_.isUndefined(appname)) {
          content.app = appname;
        }
        //1221 手记预览添加发布人
        if (bizApi === 'notes') {
          if (data.applyRid) {
            CommRestService.post('user/get', {
              rid: data.applyRid
            }, function (data) {
              content.create = {
                name: data.nickname,
                imgPath: data.imgPath
              };
              previewLink(bizApi, content);
            });
          }
        } else {
          previewLink(bizApi, content);
        }
      }, function (err) {
        $scope.$parent.loading = false;
        vcAlert(err.msg);
      });
    };

    //删除
    $scope.del = function (audit) {
      vcAlert({
        title: '提示',
        text: '确定删除？',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        cancelButtonText: '取消',
        confirmButtonText: '确定',
        closeOnConfirm: true,
        html: false
      }, function () {
        //删除动作
        $scope.$parent.loading = true;
        AuditService.deleteAudit({
          auditId: audit.id
        }, function () {
          $scope.$parent.loading = false;
          //$scope.vcTabReload({from:'deleteAudit'});
          $scope.$dirty = true;
          $scope.vcTabOnload({
            from: 'deleteAudit'
          });
          window.vcAlert('操作成功');
        }, function (err) {
          $scope.$parent.loading = false;
          window.vcAlert(err.msg);
        });
      });
    };

    //审核
    $scope.auditAction = function (audit) {
      //弹出模式窗口
      var auditId = audit.id;
      vcModalService({
        retId: 'auditRemark',
        backdropCancel: false,
        title: '审核',
        css: {
          height: '230px',
          width: '400px'
        },
        templateUrl: 'app/templates/common/tplAuditInput.html',
        controller: 'AuditSubmitController',
        success: {
          label: '通过',
          fn: function (auditRemark) {
            $scope.$parent.loading = true;
            async.waterfall([
                  function (cb) {
                    //取出审核内容
                    AuditService.getAudit({
                      auditId: auditId
                    }, function (data) {
                      cb(null, data);
                    });
                  },
                  function (data, cb) {
                    //转换业务内容为对象
                    var bizContentStr = data.content;
                    var bizObject = {};
                    try {
                      bizObject = JSON.parse(bizContentStr);
                      if(angular.isArray(bizObject)) {
                        bizObject = {data:bizContentStr};
                      }
                      bizObject.auditId = auditId;
                      bizObject.auditRemark = auditRemark;

                      //加上业务类型
                      bizObject.bizType = audit.bizType;
                      bizObject.bizId = audit.bizId;

                      if ($scope.moduleType != 0) {
                        bizObject.moduleType = $scope.moduleType;
                      }
                      cb(null, bizObject);
                    } catch (e) {
                      cb(new Error('内容无效'));
                    }
                  },
                  function (bizObj, cb) {
                    //保存实际业务数据
                    AuditService.pass(bizObj, cb);
                  }
                ],
                function (err) {
                  $scope.$parent.loading = false;
                  if (err) {
                    vcAlert("出错了，原因：" + err.msg);
                  } else {
                    CommTabService.next($scope.$vcTabInfo, 'audit', {}, ['audit', 'online']);
                    vcAlert("操作成功");
                  }
                });
            return true;
          }
        },
        cancel: {
          label: '不通过',
          fn: function (auditRemark) {
            $scope.$parent.loading = true;
            AuditService.noPass({
              auditId: auditId,
              remark: auditRemark
            }, function () {
              $scope.$parent.loading = false;
              //$scope.vcTabReload({from:'auditNoPass'});
              $scope.$dirty = true;
              $scope.vcTabOnload({
                from: 'auditNoPass'
              });
              vcAlert("操作成功");
            });
            return true;
          }
        }
      });
    };
  }]);

  app.controller('AuditSubmitController', ['$scope', function ($scope) {
    $scope.auditRemark = "";
  }]);
})();