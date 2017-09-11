/**
 * Created by hxl on 2015/10/27.
 */
;(function () {
    'use strict';
    angular.module('main.mate')
        .controller('MateController', fMateController)
        .controller('MateDetailController', fMateDetailController);

    function fMateController($scope, mateService, CommTabService, $timeout, $stateParams) {

        $scope.moduleId = parseInt($stateParams.moduleId) || 0;

        $scope.aid = 21;

        var targetTab = $stateParams.tab;
        var targetTag = $stateParams.tag;

        if (!!targetTag) {
            //只能延迟点处理
            $timeout(function(){
                CommTabService.next({index:1, tag:'list', root:'mateTabs'}, targetTag, {}, targetTab);
            }, 500);
        }
        
        $scope.totalTypes = [//筛选的数据
            {
                typeName: '相约类型', paramName: 'activityTags',
                typeValues: [{name: '全部'}, {name: '聚餐', val: 1}, {name: 'KTV', val: 2},
                    {name: '户外', val: 3}, {name: '电影', val: 4}, {name: '其他', val: 5}]
            },
            {
                typeName: '相约名额', paramName: 'mateNum',
                typeValues: [{name: '全部'}, {name: '双人相约', val: 1}, {name: '多人相约', val: 2}]
            },
            {
                typeName: '相约对象', paramName: 'mateType',
                typeValues: [{name: '全部'}, {name: '仅限男生', val: 2}, {name: '仅限女生', val: 3}, {name: '男女均可', val: 1}]
            },
            {
                typeName: '收费方式', paramName: 'costType',
                typeValues: [{name: '全部'}, {name: 'AA制', val: 2}, {name: 'TA请', val: 3}, {name: 'TA蹭', val: 4}]
            },
            {
                typeName: '发布时间', paramName: 'createTime',
                typeValues: [{name: '全部'}, {name: '今天', val: getTime()}, {name: '一天前', val: getTime(-1)},
                    {name: '三天以上'}]
            }
        ];

        $scope.sumIndex = 0;
        $scope.params = {pageNumber: 1, pageSize: 10, status: 1};
        $scope.showRun = true;
        $scope.isChangeType = true;

        $scope.data = {};
        $scope.mates = [];//展示的数据
        $scope.page = {};

        /**
         * 获取凌晨的时间戳
         * @param day   与今天相差的天数(今天之前为负数,今天之后为正数)
         * @returns {number}
         */
        function getTime(day) {
            var now = new Date();
            if (!day) {
                day = 0;
            }
            var time = 24 * 60 * 60 * 1000 * day;
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime() + time;
        }

        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                for (var i = 0; i < $scope.totalTypes.length; i++) {
                    $scope.totalTypes[i].index = 0;
                }
                $scope.myStyle = {height: '0px'};
                $scope.loadData(1);
                $scope.$dirty = false;
            }
        };

        $scope.changeMyStyle = function () {
            if ($scope.opt_show) {//open  to close
                $scope.myStyle.height = '0px';
            } else {
                if (!$scope.ul_h) {
                    var ul_h = 0;
                    $(".screening_box ul").each(function (index) {
                        ul_h += $(this).outerHeight();
                    });
                    $scope.ul_h = ul_h;
                }
                $scope.myStyle.height = $scope.ul_h + 'px';
            }
            $scope.opt_show = !$scope.opt_show;

            //调整高度
            $scope.$vcUpdateTabScroller();
        };

        /**
         * 筛选条件更改
         * @param parentIndex   父坐标
         * @param index 坐标
         */
        $scope.changeType = function (parentIndex, index) {
            if (index === $scope.totalTypes[parentIndex].index) {
                return;
            }
            $scope.sumIndex = $scope.sumIndex - $scope.totalTypes[parentIndex].index + index;
            $scope.totalTypes[parentIndex].index = index;
            var prop = $scope.totalTypes[parentIndex].paramName;
            var val = $scope.totalTypes[parentIndex].typeValues[index].val;
            if (val) {
                console.log('params set ' + prop + ':' + val);
                $scope.params[prop] = val;
            } else {
                console.log('params delete ' + prop);
                delete $scope.params[prop];
            }
            $scope.isChangeType = true;
            $scope.loadData(1);
        };

        /**
         * 切换页面
         */
        $scope.changePage = function (flag) {
            if (true === flag) {//正在进行
                if ($scope.showRun) {
                    return;
                }
                //进行切换页面,将数据存入$scope.data中
                $scope.data.offData = $scope.mates;
                $scope.data.offPage = $scope.page;
                if ($scope.data.runPage) {
                    $scope.mates = $scope.data.runData;
                    $scope.page = $scope.data.runPage;
                }
            } else {//活动结束
                if (!$scope.showRun) {
                    return;
                }
                $scope.data.runData = $scope.mates;
                $scope.data.runPage = $scope.page;
                if ($scope.data.offPage) {
                    $scope.mates = $scope.data.offData;
                    $scope.page = $scope.data.offPage;
                }
            }
            if (flag) {
                $scope.params.status = 1;//正在进行
            } else {
                $scope.params.status = 2;//已经结束
            }
            if ($scope.isChangeType) {//先拉取数据在切换界面
                $scope.loadData(1);
                $scope.isChangeType = false;
            }
            $scope.showRun = flag;
        };

        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            //console.log('params:', $scope.params);
            mateService.list($scope, $scope.params);
        };

        //进入相约详情
        $scope.goDetail = function (id) {
            CommTabService.next($scope.$vcTabInfo, 3, {mateId: id});
        };

        $scope.delete = function (mateId) {
            vcAlert({
                title: "删除相约",
                text: "确定删除此相约吗？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function () {
                mateService.offline({mateId: mateId}, function (data) {
                    $scope.loadData(1);
                }, function (err) {
                    vcAlert("删除失败", err.msg);
                });
            });


        }
    }

    fMateController.inject = ['$scope', 'mateService', 'CommTabService', '$timeout', '$stateParams'];

    function fMateDetailController($scope, CommTabService, CommRestService) {
        $scope.paramsModel = '';
        $scope.mate = {};
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.paramsModel = JSON.stringify(data);// ?
                CommRestService.post('mate/get', $scope.paramsModel, function (data) {
                    $scope.mate = data;
                });
            }
        };

        //回到列表
        $scope.gotoList = function (type) {
            CommTabService.next($scope.$vcTabInfo, 1, (type === 0 ? {} : {
                from: 'mate-to-detail'
            }));
        };

    }
})
();