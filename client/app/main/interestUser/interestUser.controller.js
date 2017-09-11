/**
 *  main.interestUser Module
 *
 * 用户管理 Description
 */

;(function() {
  'use strict';
  angular.module('main.interestUser')
    .controller('InterestUserController', InterestUserController)
    .controller('InterestUserListController', InterestUserListController);
 
  function InterestUserController() {
    // body...
  }


  //用户列表
  function InterestUserListController($scope, CommRestService, vcModalService, CacheService) {
    //初始化参数
    $scope.queryParams = {
      pageSize: 10,
      pageNumber: 0
    };

    $scope.interestUser = [];
    $scope.pager = {};
    $scope.show = {
      currentUserType: '全部用户',
      timeType: 1,
      currentUserNum: ''
    }; //页面上的显示对象
    //编辑中的下拉数据
    $scope.app = [{
      id: 1,
      name: '是'
    }, {
      id: 0,
      name: '否'
    }];
    $scope.clubCreates = [{
      id: 1,
      name: '可以'
    }, {
      id: 0,
      name: '不可以'
    }];
    $scope.currentApp = CacheService.getObject('current_user').itype;
   // itype 14
    $scope.loadData = function(pageNo) {
      //分页请求参数
      if (pageNo) {
        $scope.queryParams.pageNumber = pageNo;
      } else {
        $scope.queryParams.pageNumber++;
      }

      $scope.$parent.loading = true;
      CommRestService.post('user/list', $scope.queryParams, function(data) {
        if (data.content) {
          $scope.interestUser = data.content;
          $scope.pager = {
            firstPage: data.firstPage,
            lastPage: data.lastPage,
            totalPages: data.totalPages,
            pageNumber: data.pageNumber
          };
        }
        //改变右边人数显示
        var str = '';
        switch ($scope.show.timeType) {
          case 2:
            str = '今日人数：';
            break;
          case 3:
            str = '本月人数：';
            break;
          case 4:
            str = '近三个月人数：';
            break;
          default:
            str = '全部人数：';

        }
        $scope.show.currentUserNum = str + data.totalElements;
        $scope.$parent.loading = false;
      });
    };

    $scope.loadQueryData = function() {
      $scope.queryParams.pageNumber = 0;
      $scope.interestUser = [];
      $scope.loadData();
    };

    //根据注册时间筛选用户
    $scope.changeData = function(type) {

      var date = new Date();
      
      switch (type) {
        case 1: //全部
          $scope.show.timeType = 1;
          delete $scope.queryParams.createTime;
          break;
        case 2: //今日
          $scope.show.timeType = 2;
          //当天00
          $scope.queryParams.createTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0).getTime();
          break;
        case 3: //本月
          $scope.show.timeType = 3;
          $scope.queryParams.createTime = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0).getTime();

          break;
        case 4: //近三个月 
          $scope.show.timeType = 4;
          var oldMonth = (moment().subtract(3, 'months')).hour(0).minutes(0).second(0);
          var tTime = new Date(oldMonth);
          $scope.queryParams.createTime = tTime.getTime();
          break;
      }
      $scope.loadQueryData();

    };

    //进入编辑
    $scope.openEditUser = function(user) {

      //创建圈子
      var club = user.createClubPerm || user.create_club_perm;
      club ? club = 1 : club = 0;

      var info = {
        imgPath: user.imgPath,
        remark: user.remark || user.nickname,
        loginName: user.loginName,
        clubCreate: club,
        label: user.label,
        recommend: user.recommend,
        id: user.id
      };


      vcModalService({
        retId: 'user',
        backdropCancel: false,
        title: '用户信息',
        css: {
          height: '450px',
          width: '400px'
        },
        templateUrl: 'app/main/interestUser/pages/edit.html',
        controller: 'InterestUserListController',
        success: {
          label: '确定',
          fn: $scope.editInterestUser
        }
      }, {
        user: info
      });
    };


    //发起修改请求
    $scope.editInterestUser = function(user) {
      var reqData = {};
      reqData.rid = user.id;
      reqData.recommend = user.recommend;

      //0114 非高校活动才有创建圈子
      if($scope.currentApp !== 14){
        reqData.clubCreate = user.clubCreate;
      }
      
      //1223 后台确认输入为空时给约定默认值,后台处理
      if (_.isUndefined(user.label) || user.label === '') {
        user.label='VARICOM_123456';
      }
        reqData.label = user.label;
        CommRestService.post('user/update', reqData, function(data) {
          window.vcAlert('修改成功');
          $scope.loadQueryData();
        }, function(err) {
          window.vcAlert(err.msg);
        });
        return true;
    };
  }

  InterestUserListController.$inject = ['$scope', 'CommRestService', 'vcModalService','CacheService'];

})();