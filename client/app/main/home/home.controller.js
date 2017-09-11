/**
 * Created by wayky on 15/10/21.
 */
;(function () {
    'use strict';

    var app = angular.module('openApp');

    app.filter('moduleTypeState', function () {
        return function (input) {

            switch (input) {
                case 1:
                    return 'main.article';
                case 4:
                    return 'main.college';
                case 8:
                    return 'main.myindex';
                case 9:
                    return 'main.act';
                case 11:
                    return 'main.notes';
                case 10:
                    return 'main.mate';
                default:
                    return 'main.home';
            }
        };
    });

    app.filter('stateForBizType', function ($filter) {
        return function (bizType, moduleId, moduleType, statType) {

            var p = stateParam(bizType, moduleId, moduleType, statType);
            //1：栏目、2：banner、3：资讯、4：活动、5：手记、6：群发消息、7：相约、8:高校活动、10:首页配置
            switch (bizType) {
                case 2:
                    var _state = $filter('moduleTypeState')(moduleType);
                    return _state + '(' + p + ')';
                case 3:
                    return 'main.article(' + p + ')';
                case 4:
                    return 'main.act(' + p + ')';
                case 5:
                    return 'main.notes(' + p + ')';
                case 6:
                    return 'main.groupmsg(' + p + ')';
                case 8:
                    return 'main.college(' + p + ')';
                case 10:
                    return 'main.storeIndex('+ p +')';
                default:
                    return 'main.home';
            }

            function stateParam(bizType, moduleId, moduleType, statType) {
                var params = {};
                if (typeof moduleId !== 'undefined') {
                    params.moduleId = moduleId;
                }

                //类型( 0、草稿 1、上线审核 2、线上修改审核 3、下线审核)
                if (typeof statType !== 'undefined') {
                    if (bizType == 2) {
                        params.tab = 'banner';
                    } else {
                        params.tab = 'manage';
                    }

                    if (statType == 0) {
                        params.tag = 'draft';
                    } else {
                        params.tag = 'audit';
                    }
                }

                return JSON.stringify(params);
            }
        };
    });

    angular.module('main.home')
        .controller('UserHomeController', UserHomeController);

    function UserHomeController($scope, $filter, CacheService, echartService, CommRestService, refundActivityService, dateTimeService,
                                joinActivityAuditHomeService) {

        $scope.ready = function () {
            //statTipsInit();
            refreshStat();
            echartInit();
        };

        function getTypeName(key) {
            if (key == 'auditStatisticsList') {
                return "待审核";
            } else if (key == 'draftStatisticsList') {
                return "草稿箱";
            } else if (key == 'joinStatisticsList') {
                return "待处理";
            }

            return "未知";
        }

        function statTipsInit(statTips) {
            //获取用户的待处理信息
            //var statTips = CacheService.getStatTips();
            //if (statTips) {
            $scope.statTips = [];
            //biz_type : (1：资讯、2：栏目、3：banner、4：活动、5：手记、6：群发消息）
            for (var key in statTips) {
                if (_.isArray(statTips[key])) {
                    var statTip = statTips[key];
                    var tips = {
                        typeName: getTypeName(key),
                        subtips: []
                    };
                    var _total = 0,
                        _show = false,
                        subtip = null;
                    _.each(statTip, function (biz) {

                        subtip = {
                            bizName: biz.bizName,
                            count: biz.count
                        };

                        //未知待办项(退款、报名审核)不同页面处理,其他state跳转
                        if (biz.statisticsType === undefined) {
                            _show = true;
                            //1205 退款申请和报名审核调用不同的方法
                            if (biz.bizName === '退款申请') {
                                subtip.clickType = 1;
                            } else {
                                subtip.clickType = 2;
                            }
                        } else {
                            _show = false;
                            subtip.state = $filter('stateForBizType')(biz.bizType, biz.moduleId, biz.moduleType, biz.statisticsType);
                        }

                        tips.subtips.push(subtip);
                        _total += biz.count;
                    });

                    tips.total = _total;
                    tips.showClick = _show;

                    $scope.statTips.push(tips);
                }
            }
            //}
        }

        function refreshStat() {
            CommRestService.post("base/statTips", {}, function (data) {
                //CacheService.setStatTips(data);
                statTipsInit(data);
            });
        }

        $scope.openFunc = function (type) {
            if (type && typeof type === 'number') {
                if (type === 1) {
                    $scope.openRefund();
                } else {
                    $scope.openJoinAudit();
                }
            }
        };

        function commonChart(time, data1, data2, data3) {
            var option, legend = [],
                series = [],y=[];
            if (!_.isUndefined(data3)) {
                legend = ['新增用户次日留存率', '7日留存率', '月留存率'];
                series = [{
                    name: '新增用户次日留存率',
                    type: 'line',
                    stack: '次日留存率',
                    symbol: 'emptyCircle',
                    symbolSize: 3,
                    data: data1
                }, {
                    name: '7日留存率',
                    type: 'line',
                    stack: '7日留存率',
                    symbol: 'emptyCircle',
                    symbolSize: 3,
                    data:  data2
                }, {
                    name: '月留存率',
                    type: 'line',
                    stack: '月留存率',
                    symbol: 'emptyCircle',
                    symbolSize: 3,
                    data:  data3
                }];
                y=[{
                    type: 'value',
                    min: 0,
                    max: 100,
                    splitNumber: 5,
                    axisLabel : {
                        formatter: function(param) {
                            return param +'%';
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 0
                        }
                    }
                }];
            } else {
                legend = ['新增用户量', '登录用户量'];
                series = [{
                    name: '新增用户量',
                    type: 'line',
                    stack: '新增用户量',
                    symbol: 'emptyCircle',
                    symbolSize: 3,
                    data: data1
                }, {
                    name: '登录用户量',
                    type: 'line',
                    stack: '登录用户量',
                    symbol: 'emptyCircle', //圆点
                    symbolSize: 3,
                    data: data2
                }];
                y=[{
                    type: 'value',
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 0
                        }
                    }
                }];
            }

            option = {
                tooltip: {
                    trigger: 'axis',
                    formatter: function(param) {

                        if (!_.isUndefined(data3)){
                            var two='',seven='',thirty='';
                            param[2].data ? two=param[2].data +'%' : two='--';
                            param[1].data ? seven=param[1].data +'%' : seven='--';
                            param[0].data ? thirty=param[0].data +'%' : thirty='--';

                            return param[0].name + '<br/>新增用户次日留存率 ：' + two + '<br/>7日留存率 ：' + seven+'<br/>月留存率 ：'+thirty;
                        }else{
                            var news='',login='';
                            param[1].data ? news = param[1].data : news ='--';
                            param[0].data ? login = param[0].data : login ='--';
                            return param[0].name + '<br/>新增用户量 ：' + news + '<br/>登录用户量 ：' + login;
                        }
                    }
                },
                legend: {
                    data: legend,
                    x: 'left'
                },
                calculable: true,
                grid: {
                    borderWidth: 0
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: time,

                    axisTick: {
                        show: false,
                        onGap: false,
                        interval: 3,
                        lineStyle: {
                            color: '#8a8a8a',
                            width: 1
                        }
                    },
                    axisLabel: {
                        show: true,
                        interval: 0,
                        formatter:function(param){
                            return moment(param).format('MM/DD');
                        }
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#d0d0d0',
                            width: 1
                        }
                    },
                    splitLine: {
                        show: false,
                    },
                    splitArea: {
                        show: false
                    }
                }],
                yAxis: y,
                series: series
            };
            return option;
        }


        function echartInit() {
            var register = [],
                login = [],
                time = [],
                activeTime = [],
                twoActive = [],
                sevenActive = [],
                monthActive = [];
            CommRestService.post('base/statisticsApp', {}, function (data) {
                function registerFormat(leftNum, rightNum, arr) {

                    //错误数据,直接显示0
                    if ((parseInt(leftNum) > parseInt(rightNum)) || (parseInt(leftNum) === 0 && parseInt(rightNum) === 0)) {
                        arr.push(0);
                    } else {
                        var cou=(parseInt(leftNum) * 100) / parseInt(rightNum);
                        cou=cou.toFixed(2);
                        arr.push(cou);
                    }
                    return arr;
                }

                _.each(data, function (d) {
                    d.statisticsDate = moment(d.statisticsDate).format('YYYY-MM-DD');
                    switch (d.type) {
                        case 'role_register': //日注册量
                            register.push(d.count);
                            break;
                        case 'role_login': //日登录量
                            login.push(d.count);
                            time.push(d.statisticsDate);
                            break;
                        case 'two_day_register_active': //次日登录留存率
                            activeTime.push(d.statisticsDate);
                            registerFormat(d.count, d.contrastCount, twoActive);
                            break;
                        case 'sevent_day_register_active': //7日登录留存率
                            registerFormat(d.count, d.contrastCount, sevenActive);
                            break;
                        case 'thirty_day_register_active': //月登录留存率
                            registerFormat(d.count, d.contrastCount, monthActive);
                            break;
                    }
                });

                echartService.barAndLine('stat_dict_1', data, commonChart(time, register, login));
                echartService.barAndLine('stat_dict_2', data, commonChart(activeTime, twoActive, sevenActive, monthActive));
            });
            //后台拉取统计数据，不缓存

        }

        /**
         * 待退款
         */
        $scope.openRefund = function () {
            var z_index = (new Date().getTime()) - dateTimeService.getTimeUpToNow(0);
            refundActivityService.activate({}, {
                'z-index': z_index
            });
        };

        /**
         * 名单待审核
         */
        $scope.openJoinAudit = function () {
            var z_index = (new Date().getTime()) - dateTimeService.getTimeUpToNow(0);
            joinActivityAuditHomeService.activate({}, {
                'z-index': z_index
            });
        }
    }

    UserHomeController.inject = ['$scope', '$filter', 'CacheService', 'echartService', 'CommRestService', 'refundActivityService',
        'dateTimeService', 'joinActivityAuditHomeService'
    ];
})();