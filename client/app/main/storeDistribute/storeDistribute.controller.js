/**
 * Created by dengshaoxiang on 15/12/31.
 */
;
(function () {
    'use strict';

    angular.module('main.storeDistribute')
        .controller('VcModalController', VcModalController)
        .controller('StoreDistributeController', StoreDistributeController)

        .controller('DistributeMgrController', DistributeMgrController)
        .controller('DistributeDetailController', DistributeDetailController)
        .controller('DistributeListController', ['$scope', 'CommRestService', 'TipService', DistributeListController])
        .controller('DistributeAuditController', ['$scope', 'CommRestService', 'TipService', 'vcModalService', 'CommTabService', DistributeAuditController])

        .controller('SettingController', ['$scope', 'CommRestService', 'TipService', 'vcModalService', SettingController])

        .controller('BrokerageDetailController', ['$scope', 'CommRestService', 'TipService', 'CommTabService', BrokerageDetailController])
        .controller('BrokerageMgrController', ['$scope', 'CommRestService', 'TipService', BrokerageMgrController])
        .controller('BrokerageListController', ['$scope', '$rootScope', 'CommRestService', 'TipService', 'CommTabService', 'vcModalService', BrokerageListController])
        .filter('sexFilter', SexFilter)
        .filter('numDefault', NumDefaultFilter)
        .filter('distributeStatusFilter', DistributeStatusFilter)
    ;

    /**
     * vcModal界面Controller
     * @param $scope
     * @constructor
     */
    function VcModalController($scope) {
        $scope.auditDetail = {};
    }


    /**
     * 默认的Controller
     *
     * @constructor
     */
    function StoreDistributeController($scope) {
    }

    /**
     * 管理分销商Controller(manage)
     * @param $scope
     * @constructor
     */
    function DistributeMgrController($scope) {
    }

    /**
     * 分销详情Controller(manage)
     * @param $scope
     * @constructor
     */
    function DistributeDetailController($scope) {

        //$scope.data

        $scope.auditDetail = {};
    }

    /**
     * 分销商列表Controller
     * @param $scope
     * @param CommRestService
     * @param TipService
     * @constructor
     */
    function DistributeListController($scope, CommRestService, TipService) {

        //初始化的翻页配置
        $scope.params = {pageSize: 10, pageNumber: 0};

        /**
         * 切换tab默认调用的方法
         * @param data
         */
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.data = [];
                $scope.page = {};
                $scope.loadData(1);
                $scope.$dirty = false;
            }
        };

        /**
         * 加载页面的数据
         * @param pageNo 查询的页数
         */
        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            $scope.$parent.loading = true;
            CommRestService.post('distribute/list', $scope.params, function (data) {
                if (data.content) {
                    $scope.data = data.content;
                    $scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
                $scope.$parent.loading = false;
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('warning', err.msg, 3000);
            });
        };
    }

    /**
     * 分销商审核信息列表Controller
     * @param $scope
     * @param CommRestService
     * @param TipService
     * @param vcModalService
     * @param CommTabService
     * @constructor
     */
    function DistributeAuditController($scope, CommRestService, TipService, vcModalService, CommTabService) {
        //初始化的翻页配置
        $scope.params = {pageSize: 10, pageNumber: 0, status: 1};

        /**
         * 切换tab默认调用的方法
         * @param data
         */
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.data = [];
                $scope.page = {};
                $scope.loadData(1);
                $scope.$dirty = false;
            }
        };

        /**
         * 加载页面的数据
         * @param pageNo 查询的页数
         */
        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            $scope.$parent.loading = true;
            CommRestService.post('distribute/disapplyList', $scope.params, function (data) {//TODO 路径要修改
                if (data.content) {
                    for (var j in data.content) {
                        var applyInfo = JSON.parse(data.content[j].applyInfo);
                        for (var i in applyInfo) {
                            for (var x in applyInfo[i]) {
                                applyInfo[i] = {question: x, answer: applyInfo[i][x]};
                            }
                        }
                        data.content[j].applyInfo = applyInfo;
                    }
                    $scope.data = data.content;
                    $scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
                $scope.$parent.loading = false;
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 查看详情
         * @param type
         * @param data
         */
        $scope.detailDept = function (type, data) {
            var dept = {};
            if (type === 1) {//查看详情
                dept.retId = 'applyDetail';
                dept.title = '申请详细';
                dept.success_label = '确定';
                dept.cancel_label = '取消';
            } else if (type === 2) {
                dept.retId = 'auditDetail';
                dept.title = '申请审核';
                dept.success_label = '同意';
                dept.cancel_label = '不同意';
                dept.success = function () {
                    $scope.audit(data.id, 1);
                };
                dept.cancel = function () {
                    $scope.audit(data.id, 2);
                };
            }
            vcModalService({
                retId: dept.retId,
                backdropCancel: false,
                title: dept.title,
                css: {
                    height: '400px',
                    width: '600px'
                },
                templateUrl: 'app/templates/storeDistribute/auditDetail.html',
                controller: 'VcModalController',
                success: {
                    label: dept.success_label,
                    fn: dept.success
                },
                cancel: {
                    label: dept.cancel_label,
                    fn: dept.cancel
                }
            }, {
                data: data
            });
        };

        /**
         * 审核接口
         */
        $scope.audit = function (id, op) {
            CommRestService.post('distribute/audit', {distributorId: id, op: op}, function (data) {
                if (op === 3) {//删除
                    TipService.add('success', '删除成功', 3000);
                } else if (op === 2) {//不通过
                    TipService.add('success', '审核成功', 3000);
                    CommTabService.dirty($scope.$vcTabInfo, ['distributeRefused'], 'distributeMgr', true);
                } else if (op === 1) {//通过
                    TipService.add('success', '审核成功', 3000);
                    CommTabService.dirty($scope.$vcTabInfo, ['distributeRefused'], 'distributeMgr', true);
                }
                $scope.loadData($scope.params.pageNumber);
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        }
    }


    /**
     * 分销设置Controller
     * @param $scope
     * @param CommRestService
     * @param TipService
     * @param vcModalService
     * @constructor
     */
    function SettingController($scope, CommRestService, TipService, vcModalService) {
        $scope.brokerageUeditorId = 'brokerage_ueditor_instance';

        $scope.awardUeditorId = 'award_ueditor_instance';

        /**
         * 切换tab默认调用的方法
         * @param data
         */
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.data = {};
                $scope.loadData();
                $scope.$dirty = false;
            }
        };

        /**
         * 加载页面的数据
         */
        $scope.loadData = function () {
            $scope.$parent.loading = true;
            CommRestService.post('distribute/dispercentGet', {}, function (data) {
                if (data) {
                    if (data.percent1) {
                        data.percent1 = 100 * data.percent1;
                    }
                    if (data.percent2) {
                        data.percent2 = 100 * data.percent2;
                    }
                    $scope.data = data;
                }
                $scope.$parent.loading = false;
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 保存功能
         */
        $scope.save = function () {
            if (!$scope.data.percent1 || !$scope.data.percent2) {
                TipService.add('warning', '佣金设置比例不能为空', 3000);
                return;
            } else if ($scope.data.percent2 > $scope.data.percent1) {
                TipService.add('warning', '三级分销商比例不能大于二级分销商比例', 3000);
                return;
            }
            var params = {
                percent1: $scope.data.percent1 / 100,
                percent2: $scope.data.percent2 / 100
            };
            if ($scope.data.creadme) {
                params.creadme = $scope.data.creadme;
            }
            if ($scope.data.breadme) {
                params.breadme = $scope.data.breadme;
            }
            CommRestService.post('distribute/dispercentAdd', params, function (data) {
                TipService.add('success', '保存成功', 3000);
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 获取邀请码
         */
        $scope.getCode = function () {
            CommRestService.post('distribute/sellercodeGen', {}, function (data) {
                vcModalService({
                    retId: '',
                    backdropCancel: false,
                    title: '邀请码',
                    css: {
                        height: '200px',
                        width: '400px'
                    },
                    templateUrl: 'app/templates/storeDistribute/settingCode.html',
                    controller: 'VcModalController',
                }, {
                    code: data
                });
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        }
    }

    /**
     *佣金manageController
     * @param $scope
     * @param CommRestService
     * @param TipService
     * @constructor
     */
    function BrokerageMgrController($scope, CommRestService, TipService) {

    }

    /**
     * 佣金列表Controller
     * @param $scope
     * @param CommRestService
     * @param TipService
     * @param CommTabService
     * @param vcModalService
     * @constructor
     */
    function BrokerageListController($scope, $rootScope, CommRestService, TipService, CommTabService, vcModalService) {
        //初始化的翻页配置
        $scope.params = {pageSize: 10, pageNumber: 0, _status: 1, type: 1};

        /**
         * 设置方法的路径
         */
        $scope.checkUrl = function () {
            var url;
            if ($scope.params._status === 2) {//查询发放记录
                url = 'distribute/payoffList';
            } else if ($scope.params._status === 1) {//查询待发放
                if ($scope.params.type === 1) {//查询佣金待发放
                    url = 'distribute/commissionList';
                } else if ($scope.params.type === 2) {//查询奖金待发放
                    url = 'distribute/bonusList';
                }
            }
            $scope.url = url;
        };

        /**
         * 切换tab默认调用的方法
         */
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.data = [];
                $scope.page = {};
                $scope.$watch('params.startTime', function (_new) {
                    if (typeof(_new) === 'undefined') {
                        return;
                    }
                    $scope.loadData(1);
                });
                $scope.$watch('params.endTime', function (_new) {
                    if (typeof(_new) === 'undefined') {
                        return;
                    }
                    $scope.loadData(1);
                });
                $scope.checkUrl();
                $scope.loadData(1);
                $scope.$dirty = false;
            }
        };

        /**
         * 加载页面的数据
         * @param pageNo 查询的页数
         */
        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            if ($scope.params.startTime) {
                //moment($scope.params.startTime).format('YYYY-MM-DD');
                $scope.params.timeBeg = moment($scope.params.startTime)._d.getTime();
            }
            if ($scope.params.endTime) {
                $scope.params.timeEnd = moment($scope.params.endTime)._d.getTime();
            }
            $scope.$parent.loading = true;
            CommRestService.post($scope.url, $scope.params, function (data) {
                if (data.content) {
                    $scope.data = data.content;
                    $scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
                $scope.$parent.loading = false;
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 查看详情
         * @param rid
         */
        $scope.getDetail = function (rid,name) {
            if ($scope.params.type === 1) {
                CommTabService.next($scope.$vcTabInfo, 'brokerageDetail', {dataId: rid}, 'distributeTabs');
            } else if ($scope.params.type === 2) {
                var params = {sellerRid: rid};
                if ($scope.params.endTime) {
                    params.timeEnd = moment($scope.params.endTime)._d.getTime();
                }
                CommRestService.post('distribute/bonusGet', params, function (data) {
                    if (data) {
                        data.name = name;
                        vcModalService({
                            retId: 'retData',
                            backdropCancel: false,
                            title: '奖金明细算法',
                            css: {
                                height: '250px',
                                width: '400px'
                            },
                            templateUrl: 'app/templates/storeDistribute/awardDetail.html',
                            controller: 'StoreDistributeController'
                        }, {
                            data: data
                        });
                    }
                }, function (err) {
                    TipService.add('warning', err.msg, 3000);
                });
            }
        };

        /**
         * 支付
         */
        $scope.pay = function () {
            var rids = '';
            var alertMsg = {num: 0, sum: 0};
            for (var i in $scope.data) {
                if ($scope.checkAll || $scope.data[i]._checked) {
                    if (!$scope.data[i].account) {
                        vcAlert('支付的对象必须绑定收款账号');
                        return;
                    }
                    alertMsg.num = alertMsg.num + 1;
                    if ($scope.params.type === 1) {//佣金
                        alertMsg.sum = alertMsg.sum + $scope.data[i].toBeCommission;
                    } else if ($scope.params.type === 2) {//奖金
                        alertMsg.sum = alertMsg.sum + $scope.data[i].toBeBonus;
                    }
                    rids = rids + $scope.data[i].rid + ',';
                }
            }
            if (rids.length === 0) {
                vcAlert('请选择要支付的对象');
                return;
            }
            window.vcAlert({
                title: '支付',
                text: '共 ' + alertMsg.num + ' 人，' + alertMsg.sum + '元，是否支付?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function () {
                var dept = {};
                if ($scope.params.type === 1) {//佣金支付
                    dept.url = 'distribute/commissionPayoff';
                    dept.realRoot = 'brokerageMgr';
                    dept.tags = ['brokerageClose'];
                    dept.msg = '佣金支付成功';
                } else if ($scope.params.type === 2) {//奖金支付
                    dept.url = 'distribute/bonusPayoff';
                    dept.realRoot = 'awardMgr';
                    dept.tags = ['awardClose'];
                    dept.msg = '奖金支付成功';
                } else {
                    return;
                }
                var params = {sellerRids: rids};
                if ($scope.params.endTime) {
                    params.timeEnd = moment($scope.params.endTime)._d.getTime();
                }
                CommRestService.post(dept.url, params, function (data) {
                    $scope.loadData($scope.params.pageNumber);
                    CommTabService.dirty($scope.$vcTabInfo, dept.tags, dept.realRoot, true);
                    TipService.add('success', dept.msg, 3000);
                }, function (err) {
                    TipService.add('warning', err.msg, 3000);
                });
            });
        };

        /**
         * 导出详细
         */
        $scope.excel = function () {

            if ($scope.params.startTime) {
                $scope.params.timeBeg = moment($scope.params.startTime)._d.getTime();
            }
            if ($scope.params.endTime) {
                $scope.params.timeEnd = moment($scope.params.endTime)._d.getTime();
            }

            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.url = $scope.url;
            if ($scope.params._status === 2) {//查询发放记录
                if ($scope.params.type === 1) {//佣金
                    _params.fileName = '佣金发放记录';
                } else if ($scope.params.type === 2) {//奖金
                    _params.fileName = '奖金发放记录';
                }
            } else if ($scope.params._status === 1) {//查询待发放
                if ($scope.params.type === 1) {//佣金
                    _params.fileName = '佣金待发放记录';
                } else if ($scope.params.type === 2) {//奖金
                    _params.fileName = '奖金待发放记录';
                }
            }
            /*
            CommRestService.post('distribute/excel', _params, function (data) {
                if (data.ret == 0) {
                    location.href = data.excel;
                } else {
                    vcAlert("出错了，原因：" + data.err);
                }
            });
            */
            //转成提交数组
            var inputs = [];
            _.map(_params, function(v, k) {
                inputs.push({name:k,value:v});
            });
            $rootScope.exportExcel('distribute/excel', inputs);
        };

    }

    /**
     * 佣金详情
     * @param $scope
     * @param CommRestService
     * @param TipService
     * @param CommTabService
     * @constructor
     */
    function BrokerageDetailController($scope, CommRestService, TipService, CommTabService) {
        //初始化的翻页配置
        $scope.params = {pageSize: 10, pageNumber: 0};

        $scope.vcTabOnload = function (data, lastTabInfo) {
            $scope.lastTabInfo = lastTabInfo;
            if (data) {
                $scope.params.sellerRid = data.dataId;
                $scope.data = [];
                $scope.page = {};
                $scope.loadData(1);
            }
        };

        $scope.loadData = function (pageNo) {
            if (pageNo) {
                $scope.params.pageNumber = pageNo;
            } else {
                $scope.params.pageNumber++;
            }
            CommRestService.post('distribute/commissionGet', $scope.params, function (data) {
                if (data.content) {
                    $scope.data = data.content;
                    for (var i in data.content.property) {
                        data.content.property[i] = JSON.parse(data.content.property[i]);
                    }
                    $scope.page = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        $scope.back = function () {
            CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
        };

    }


    function SexFilter() {
        return function (input) {
            switch (input) {
                case 1:
                    return '男';
                case 2:
                    return '女';
                default:
                    return '男';
            }
        };
    }

    function NumDefaultFilter() {
        return function (input) {
            if (input) {
                return input;
            } else {
                return 0;
            }
        }
    }

    function DistributeStatusFilter() {//1待审核 2 审核通过 3 审核不通过
        return function (input) {
            switch (input) {
                case 1:
                    return '待审核';
                case 2:
                    return '已通过';
                case 3:
                    return '不通过';
                case 4:
                    return '已注册';
            }
        };
    }
})
();