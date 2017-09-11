;(function() {
  'use strict';
  /**
   *  Module  previewApp
   *
   * 手记预览
   */
  angular.module('previewApp', ['ngSanitize'])
    .controller('ActivityDetailCtrl', ActivityDetailCtrl);

  function ActivityDetailCtrl($scope) {
    var week = ['一', '二', '三', '四', '五', '六', '日', ],
      difficulty = ['无难度', '初级难度', '中级难度', '自虐型'];

    $scope.activity = store.get('preview_activity');
    //console.log($scope.activity);
    //难度等级
    $scope.activity.level = difficulty[$scope.activity.level - 1];


    /***********咨询begin*************/
    //只显示一个咨询
    function defaultConsult() {
      $scope.activity.consultInfo = [];
      $scope.consultInfo.class = 'open';
      $scope.consultInfo.default = true; //代表是默认
      angular.element(document.querySelector('#service_consult')).css({
        heigth: 'auto'
      });
      $scope.activity.consultInfo[0] = consultData[0];
    }
    $scope.consultInfo = {};
    var consultData = [];
    if (typeof $scope.activity.consultInfo === 'string') {
      $scope.activity.consultInfo = JSON.parse($scope.activity.consultInfo);
      consultData = angular.copy($scope.activity.consultInfo);
      //只有一组咨询
      if ($scope.activity.consultInfo.length === 1) {
        $scope.consultInfo.class = 'one_type';
      }

      //如有多个咨询默认显示一个
      if ($scope.activity.consultInfo.length > 1) {
        defaultConsult();
      }
    }

    $scope.showConGroup = function() {
      //动态添加(多个)咨询高度
      if ($scope.consultInfo.default) {
        //展开时显示全部咨询
        $scope.activity.consultInfo = consultData;
        angular.element(document.querySelector('#consult')).css({
          height: 'auto'
        });
        $scope.consultInfo.default = false;
      } else {
        defaultConsult();
      }
    };
    /***********咨询end*************/



    //集合地(领队)
    //只显示一个领队

    $scope.leaders = {};
    var leadersData = [];

    function defaultLeaders() {
      $scope.assembles.leaders = [];
      $scope.leaders.class = 'open';
      $scope.leaders.default = true; //代表是默认
      angular.element(document.querySelector('#service_leaders')).css({
        heigth: 'auto'
      });
      $scope.assembles.leaders[0] = leadersData[0];
    }

    if (typeof $scope.activity.assembleInfo === 'string') {
      $scope.assembles = JSON.parse($scope.activity.assembleInfo);
      for (var j = 0, ass = $scope.assembles; j < ass.length; j++) {
        $scope.assembles.leaders = ass[j].leaders;
        leadersData = angular.copy(ass[j].leaders);
        if (!angular.isUndefined(ass[j].time) && ass[j].time !== null && ass[j].time !== '') {
          if ($scope.activity.subType === 1 || $scope.activity.subType === 3) {
            ass[j].time = moment(ass[j].time).format('YYYY-MM-DD HH:mm');
          } else {
            ass[j].time = moment(ass[j].time).format('HH:mm');
          }
        }


        //只有一组领队
        if ($scope.assembles.leaders.length === 1) {
          $scope.leaders.class = 'one_type';
        }

        //如有多个领队默认显示一个
        if ($scope.assembles.leaders.length > 1) {
          defaultLeaders();
        }

      }
    }

    $scope.showLeadersGroup = function() {
      //动态添加(多个)领队高度
      if ($scope.leaders.default) {
        //展开时显示全部领队
        $scope.assembles.leaders = leadersData;
        //找到所有领队并动态赋值父级高度 
        angular.element(document.querySelector('#leaders')).css({
          height: 'auto'
        });
        $scope.leaders.default = false;
      } else {
        defaultLeaders();
      }
    };



    //tabs页切换(详情/集合地/须知)
    $scope.tabs = {};
    $scope.current = 'jhd';

    //切换活动详情/须知/集合地
    $scope.showTab = function(type) {
      switch (type) {
        case 'xq':
          $scope.tabs.current = 'xq';
          $scope.tabs.xq = true;
          $scope.tabs.xz = false;
          $scope.tabs.jhd = false;
          break;
        case 'xz':
          $scope.tabs.current = 'xz';
          $scope.tabs.xz = true;
          $scope.tabs.xq = false;
          $scope.tabs.jhd = false;
          break;
        default:
          $scope.tabs.current = 'jhd';
          $scope.tabs.jhd = true;
          $scope.tabs.xz = false;
          $scope.tabs.xq = false;
          break;
      }
    };
    $scope.showTab('jhd');


    /***********分组begin*************/
    //活动分组
    if (typeof $scope.activity.eventGroupInfo === 'string') {
      $scope.groups = JSON.parse($scope.activity.eventGroupInfo);
      if (angular.isArray($scope.groups) && $scope.groups.length !== 0) {
        for(var q=0,eveGroup=$scope.groups;q <eveGroup.length;q++){
         
          if(!eveGroup[q].prePay){
            eveGroup[q].prePay=0;
          }
          if(!eveGroup[q].price){
            eveGroup[q].price=0;
          }
        }
        $scope.groups.show = true;
      }
      //只有一组分组
      if ($scope.groups.length === 1) {
        $scope.groups.class = 'one_type';
        $scope.groups.display = true;
      }

    }
    //多个分组
    $scope.showGroup = function() {
      $scope.groups.display = !$scope.groups.display;
      //动态添加(多个)分组高度
      if ($scope.groups.display) {
        $scope.groups.class = 'open';
        //找到所有分组并动态赋高度到父级
        angular.element(document.querySelector('#group')).css({
          height: 'auto'
        });
      } else {
        $scope.groups.class = '';
        angular.element(document.querySelector('#actGroup')).css({
          height: 'auto'
        });
      }
    };
    /***********分组end*************/


    //普通/赛事活动
    switch ($scope.activity.subType) {
      case 1:
      case 3:
        //活动天数
        $scope.activity.day = dateDiff($scope.activity.startTime, $scope.activity.endTime)+1;
        //添加截止日期
        switch ($scope.activity.activityStatus) {
          case 2:
            $scope.activity.deadlineTime = '报名截止';
            break;
          case 3:
            $scope.activity.deadlineTime = '活动结束';
            break;
          default:
            $scope.activity.deadlineTime = distanceDesc($scope.activity.registEndTime);
        }
        $scope.activity.activityTitle='';
        if (!angular.isUndefined($scope.activity.startTime) && $scope.activity.startTime !== '') {
          $scope.activity.activityTitle = moment($scope.activity.startTime).format('YYYY-MM-DD HH:mm');
        }
        if (!angular.isUndefined($scope.activity.endTime) && $scope.activity.endTime !== '') {
          $scope.activity.activityTitle += '出发 -- ' + moment($scope.activity.endTime).format('YYYY-MM-DD') + '返程';
        }

        break;
      case 2:
        //活动天数
        $scope.activity.day = $scope.activity.tripDur;
        if ($scope.activity.subTag === 127) { //127计算为每天出发
          $scope.activity.activityTitle = '每天出发';

        } else {
          var t = '每周';
          for (var i = 0; i < $scope.activity.subTags.length; i++) {
            if ($scope.activity.subTags[i]) {
              t += week[i];
            }
          }
          t += '出发';
          $scope.activity.activityTitle = t;
        }
        $scope.activity.deadlineTime = '';
        break;
      default:
        break;

    }

    //报名截止日期
    function distanceDay(source, target) {
      return parseInt((target - source) / (24 * 3600 * 1000));
    }
    //相距天数的描述
    function distanceDesc(target) {
      var tar = new Date(target).getTime();
      var _n = new Date();
      var _new = new Date(_n.getFullYear(), _n.getMonth(), _n.getDate());
      var day = distanceDay(_new.getTime(), tar);
      if (day === 0) {
        return '报名日期截止至：今天';
      } else if (day === 1) {
        return '报名日期截止至：明天';
      } else if (day > 1) {
        return '报名日期截止至：' + day + '天以后';
      } else {
        return '报名截止';
      }
    }

    function dateDiff(start, end) { //start和end是2006-12-18格式  
      var aDate, oDate1, oDate2, iDays;
      if ((!angular.isUndefined(start) && start !== '') && (!angular.isUndefined(end) && end !== '')) {
        start = moment(start).format('YYYY-MM-DD');
        end = moment(end).format('YYYY-MM-DD');
        aDate = start.split('-');
        oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]); //转换为12-18-2006格式  
        aDate = end.split('-');
        oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);
       
        iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24); //把相差的毫秒数转换为天数  
        return iDays;
      }else{
        return '';
      }
    }

    //详情需要htmlDecode
    var htmlDecode = function (str) {
      var div = document.createElement("div");
      div.innerHTML = str;
      var txt = div.innerText || div.textContent;
      div = null;
      return txt;
    };

    $scope.introDecoded = function(){
      if ($scope.activity.introduce) {
        return htmlDecode($scope.activity.introduce);
      }

      return $scope.activity.introduce;
    }
  }
})();