/**
 * Created by dengshaoxiang on 16/01/04.
 */

(function () {
    'use strict';

    angular.module('main.orderMgr')
        .controller('VcModalController', VcModalController)
        .controller('VcModalReceiveController', ['$scope', 'CommRestService', 'TipService', VcModalReceiveController])
        .controller('OrderMgrController', OrderMgrController)
        .controller('OrderListController', ['$scope', 'CommRestService', 'TipService', 'CommTabService', 'vcModalService', OrderListController])
        .controller('OrderDetailController', ['$scope', 'CommRestService', 'TipService', 'CommTabService', 'vcModalService', OrderDetailController])
        .filter('statusFilter', StatusFilter)
        .filter('numDefault', NumDefaultFilter)
    ;


    /**
     * 默认的Controller
     *
     */
    function VcModalController($scope) {
        $scope.retData = {};
    }

    /**
     *修改收货地址的Controller
     */
    function VcModalReceiveController($scope, CommRestService, TipService) {
        $scope.retData = {};

        $scope.loadData = function () {
            var params = {
                'province': $scope.data.address.province,
                'city': $scope.data.address.city,
                'county': $scope.data.address.county
            };
            $scope.retData = params;
            $scope.retData.detail = $scope.data.address.detail;
            CommRestService.post('order/cityAddressList', params, function (data) {
                if (data) {//{citys: Array[21], counties: Array[21], provinces: Array[34]}
                    $scope._province = data.provinces;
                    $scope._city = data.citys;
                    $scope._county = data.counties;
                }
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 改变城市信息
         */
        $scope.changeCity = function (type) {
            if (type === 'province') {
                if ($scope.retData.province) {
                    for (var i in $scope._province) {
                        if ($scope.retData.province === $scope._province[i].name) {
                            $scope.getCity('city', $scope._province[i].id);
                            break;
                        }
                    }
                } else {
                    delete $scope._city;
                }
                delete $scope._county;
                delete $scope.retData.city;
                delete $scope.retData.county;
            } else if (type === 'city') {
                if ($scope.retData.city) {
                    for (var i in $scope._city) {
                        if ($scope.retData.city === $scope._city[i].name) {
                            $scope.getCity('county', $scope._city[i].id);
                            break;
                        }
                    }
                } else {
                    delete $scope._county;
                }
                delete $scope.retData.county;
            }
        };

        /**
         * 获取城市信息
         */
        $scope.getCity = function (type, id) {
            var params = {};
            if (id) {
                params.parentId = id;
            } else {
                params.parentId = 100000;
            }
            CommRestService.post('order/cityList', params, function (data) {
                if (type === 'province') {
                    $scope._province = data;
                } else if (type === 'city') {
                    $scope._city = data;
                } else if (type === 'county') {
                    $scope._county = data;
                }
            });
        };

        $scope.loadData();

    }

    /**
     * 默认的Controller
     *
     */
    function OrderMgrController($scope) {
    }

    /**
     * 列表Controller
     */
    function OrderListController($scope, CommRestService, TipService, CommTabService, vcModalService) {
        //订单的状态值
        $scope.status = 2;
        //初始化的翻页配置
        $scope.params = {pageSize: 10, pageNumber: 0};

        $scope.showSelect = false;

        //是否显示筛选条件
        $scope.showSelectView = function () {
            return $scope.params.identUid || $scope.params.transportNumber ||
                $scope.params.transportCompany || $scope.params.name || $scope.params.phone ||
                $scope.params.province || $scope.params.city || $scope.params.county ||
                $scope.params.nickname || $scope.params.startTime || $scope.params.endTime;
        };

        /**
         * 删除筛选的条件
         */
        $scope.clearParams = function () {
            $scope.params = {pageSize: $scope.params.pageSize, pageNumber: 0, status: $scope.params.status};
            delete $scope._select_province;
            $scope.changeCity('province');
        };

        $scope.toggerSelect = function () {
            $scope.showSelect = !$scope.showSelect;

            //调整高度
            $scope.$vcUpdateTabScroller();
        };

        /**
         * 切换tab默认调用的方法
         * @param data
         */
        $scope.vcTabOnload = function (data) {
            if ($scope.$dirty) {
                $scope.data = [];
                $scope.page = {};
                $scope.params.status = $scope.status;
                CommRestService.post('order/logisticscompanyList', {}, function (companys) {//查询快递公司
                    if (companys) {
                        $scope.companys = companys;
                    }
                }, function (err) {
                    TipService.add('warning', err.msg, 3000);
                });
                $scope.getCity('province');
                $scope.$dirty = false;
            }
            if ($scope.params.pageNumber === 0) {
                $scope.params.pageNumber = 1;
            }
            $scope.loadData($scope.params.pageNumber);//订单每次页面跳转刷新数据(筛选条件就不管了)
        };

        /**
         * 查看详情页面
         */
        $scope.showDetail = function (tagName, id) {
            CommTabService.next($scope.$vcTabInfo, tagName, {dataId: id});
        };

        /**
         * 获取城市信息
         */
        $scope.getCity = function (type, id) {
            var params = {};
            if (id) {
                params.parentId = id;
            } else {
                params.parentId = 100000;
            }
            CommRestService.post('order/cityList', params, function (data) {
                if (type === 'province') {
                    $scope._province = data;
                } else if (type === 'city') {
                    $scope._city = data;
                } else if (type === 'county') {
                    $scope._county = data;
                }
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 改变城市信息
         */
        $scope.changeCity = function (type) {
            if (type === 'province') {
                if ($scope._select_province) {
                    $scope.params.province = $scope._select_province.name;
                    $scope.getCity('city', $scope._select_province.id);
                } else {
                    delete $scope.params.province;
                    delete $scope._city;
                }
                delete $scope._county;
                delete $scope.params.city;
                delete $scope.params.county;
            } else if (type === 'city') {
                if ($scope._select_city) {
                    $scope.params.city = $scope._select_city.name;
                    $scope.getCity('county', $scope._select_city.id);
                } else {
                    delete $scope.params.city;
                    delete $scope._county;
                }
                delete $scope.params.county;
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
            if ($scope.params.startTime) {
                $scope.params.startCreateTime = moment($scope.params.startTime)._d.getTime();
            }
            if ($scope.params.endTime) {
                $scope.params.endCreateTime = moment($scope.params.endTime)._d.getTime();
            }

            if($scope.showSelect){
                $scope.toggerSelect();
            }
            CommRestService.post('order/list', $scope.params, function (data) {
                if (data.content) {
                    var tdata = data.content;
                    for (var i in tdata) {
                        if (tdata[i].address) {
                            tdata[i].address = JSON.parse(tdata[i].address);
                        }
                        if (tdata[i].p) {
                            tdata[i].p = JSON.parse(tdata[i].p);

                            for (var j in tdata[i].p) {
                                if (tdata[i].p[j].property) {
                                    tdata[i].p[j].propertyJson = tdata[i].p[j].property;
                                    tdata[i].p[j].property = JSON.parse(tdata[i].p[j].property);
                                }
                            }
                        }
                    }
                    $scope.data = tdata;
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
         * 退款
         */
        $scope.refund = function (id, goods) {
            var params = {orderId: id, goodsId: goods.goodsId, title: goods.goodsName};
            if (goods.propertyJson) {
                params.property = goods.propertyJson;
            }
            if (goods.property) {//加入规格
                for (var i in goods.property) {
                    params.title = params.title + '   ' + i + '：' + goods.property[i];
                }
            }
            //加入退款金额
            params.title = params.title + '   退款金额：' + goods.realPrice * goods.num;
            window.vcAlert({
                title: '退款',
                text: '退款操作不可撤销!请尽快退款给买家',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function () {
                CommRestService.post('order/refund', params, function (data) {
                    goods.status = 2;
                }, function (err) {
                    TipService.add('warning', err.msg, 3000);
                });
            });
        };

        /**
         * 取消订单
         */
        $scope.cancelOrder = function (id) {
            window.vcAlert({
                title: '',
                text: '是否取消订单',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function () {
                CommRestService.post('order/cancel', {orderId: id}, function (data) {
                    $scope.loadData($scope.params.pageNumber);
                    CommTabService.dirty($scope.$vcTabInfo, ['errorOrder'], 'orderMgr', true);
                    TipService.add('success', '取消订单成功', 3000);
                }, function (err) {
                    TipService.add('warning', err.msg, 3000);
                });
            });
        };


        /**
         * 发货按钮
         */
        $scope.sendClick = function (order) {
            $scope.order = order;
            var showInput = false;
            if (!$scope.companys) {//判断是否存在快递公司数据,在vcTabOnload中已查询
                showInput = true;//不存在则显示input元素
            }
            vcModalService({
                retId: 'retData',
                backdropCancel: false,
                title: '填写物流单号',
                css: {
                    height: '300px',
                    width: '600px'
                },
                templateUrl: 'app/templates/orderMgr/addTransport.html',
                controller: 'VcModalController',
                success: {
                    label: '确认',
                    fn: $scope.addTransport
                }
            }, {
                showInput: showInput,
                data: order,
                companys: $scope.companys
            });
        };

        /**
         * 发货
         */
        $scope.addTransport = function (retData) {
            if (!retData.company) {
                TipService.add('warning', '发货失败，请填写快递公司', 3000);
                return false;
            }
            if (!retData.number) {
                TipService.add('warning', '发货失败，请填写快递单号', 3000);
                return false;
            }
            console.log(retData);
            var params = {
                orderId: $scope.order.id,
                company: retData.company,
                number: retData.number,
                title: '快递公司：' + retData.company + '  快递单：' + retData.number
            };
            CommRestService.post('order/transportAdd', params, function (data) {
                TipService.add('success', '发货成功', 3000);
                $scope.loadData($scope.params.pageNumber);
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 查看物流
         */
        $scope.showLogistics = function (order) {
            $scope.$parent.loading = true;
            CommRestService.post('order/logisticsGet', {
                transportNumber: order.transportNumber,
                company: order.transportCompany
            }, function (data) {
                $scope.$parent.loading = false;
                vcModalService({
                    retId: 'retData',
                    backdropCancel: false,
                    title: '物流跟踪',
                    css: {
                        height: '300px',
                        width: '600px'
                    },
                    templateUrl: 'app/templates/orderMgr/showLogistics.html',
                    controller: 'VcModalController'
                }, {
                    data: data
                });
            }, function (err) {
                $scope.$parent.loading = false;
                TipService.add('warning', err.msg, 3000);
            });
        }
    }

    /**
     * 订单详情页面
     */
    function OrderDetailController($scope, CommRestService, TipService, CommTabService, vcModalService) {
        /**
         * 切换tab默认调用的方法
         */
        $scope.vcTabOnload = function (data, lastTabInfo) {
            $scope.lastTabInfo = lastTabInfo;
            if (data) {
                $scope.data = [];
                $scope.loadData(data.dataId);
            }
        };

        $scope.back = function () {
            CommTabService.next($scope.$vcTabInfo, $scope.lastTabInfo.index, {}, $scope.lastTabInfo.root);
        };

        /**
         * 加载页面的数据
         */
        $scope.loadData = function (id) {
            CommRestService.post('order/get', {orderId: id}, function (data) {
                if (data) {
                    if (data.address) {
                        data.address = JSON.parse(data.address);
                    }
                    if (data.p) {
                        data.p = JSON.parse(data.p);
                        for (var i in data.p) {
                            if (data.p[i].property) {
                                data.p[i].property = JSON.parse(data.p[i].property);
                            }
                        }
                    }
                    $scope.data = data;
                }
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
            CommRestService.post('log/list', {pageSize: 999, pageNumber: 1, bizId: id, bizType: 11}, function (data) {
                if (data.content) {
                    $scope.log = data.content;
                }
            });
        };

        /**
         * 弹窗
         */
        $scope.vcModal = function (order, type) {
            $scope.$parent.loading = true;
            var dept = {};
            if (type === 1) {//发货弹窗
                dept.title = '填写物流单号';
                dept.tmplateUrl = 'app/templates/orderMgr/addTransport.html';
                dept.controller = 'VcModalController';
                dept.css = {height: '300px', width: '600px'};
                dept.successFn = $scope.addTransport;
                dept.data = {data: order};
                CommRestService.post('order/logisticscompanyList', {}, function (data) {//查询快递公司
                    $scope.$parent.loading = false;
                    if (data) {
                        dept.data.companys = data;
                        $scope.showModal(dept);
                    }
                }, function (err) {
                    $scope.$parent.loading = false;
                    TipService.add('warning', err.msg, 3000);
                });
            } else if (type === 2) {//修改收货地址弹窗
                dept.title = '修改收货地址';
                dept.tmplateUrl = 'app/templates/orderMgr/receiveUpdate.html';
                dept.controller = 'VcModalReceiveController';
                dept.css = {height: '250px', width: '600px'};
                dept.successFn = $scope.receiveUpdate;
                dept.data = {data: order};
                $scope.$parent.loading = false;
                $scope.showModal(dept);
            } else if (type === 3) {//物流跟踪
                dept.title = '物流跟踪';
                dept.tmplateUrl = 'app/templates/orderMgr/showLogistics.html';
                dept.controller = 'VcModalController';
                dept.css = {height: '300px', width: '600px'};
                CommRestService.post('order/logisticsGet', {
                    transportNumber: order.transportNumber,
                    company: order.transportCompany
                }, function (data) {
                    $scope.$parent.loading = false;
                    dept.data = {data: data};
                    $scope.showModal(dept);
                }, function (err) {
                    $scope.$parent.loading = false;
                    TipService.add('warning', err.msg, 3000);
                });
            }
        };

        /**
         * 展示modal
         */
        $scope.showModal = function (dept) {
            vcModalService({
                retId: 'retData',
                backdropCancel: false,
                title: dept.title,
                css: dept.css,
                templateUrl: dept.tmplateUrl,
                controller: dept.controller,
                success: {
                    label: '确认',
                    fn: dept.successFn
                }
            }, dept.data);
        };


        /**
         * 发货
         */
        $scope.addTransport = function (retData) {
            if (!retData.company) {
                TipService.add('warning', '发货失败，请填写快递公司', 3000);
                return false;
            }
            if (!retData.number) {
                TipService.add('warning', '发货失败，请填写快递单号', 3000);
                return false;
            }
            var params = {
                orderId: $scope.data.id,
                company: retData.company,
                number: retData.number,
                title: '快递公司:' + retData.company + '  ' + '快递单:' + retData.number
            };
            CommRestService.post('order/transportAdd', params, function (data) {
                TipService.add('success', '发货成功', 3000);
                $scope.loadData(params.orderId);
                $scope.lastTabInfo.index = 2;
                $scope.lastTabInfo.tag = 'sent';
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 修改收货地址
         */
        $scope.receiveUpdate = function (retData) {
            if (!retData.detail || !retData.province || !retData.city || !retData.county) {
                TipService.add('warning', '修改收货地址失败,必须输入详细的收货地址', 3000);
                return false;
            }
            var address = {
                province: retData.province,
                city: retData.city,
                county: retData.county,
                detail: retData.detail
            };
            var oldAddress = $scope.data.address.province + $scope.data.address.city
                + $scope.data.address.county + $scope.data.address.detail;
            var newAddress = retData.province + retData.city + retData.county + retData.detail;
            var params = {
                orderId: $scope.data.id,
                address: JSON.stringify(address),
                title: '新地址：' + newAddress + ' 旧地址：' + oldAddress
            };
            CommRestService.post('order/receiveUpdate', params, function (data) {
                TipService.add('success', '修改收货地址成功', 3000);
                $scope.loadData(params.orderId);
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
        };

        /**
         * 保存备注
         */
        $scope.saveRemark = function () {
            var params = {orderId: $scope.data.id};
            if ($scope.data.adminRemark) {
                params.adminRemark = $scope.data.adminRemark;
            } else {
                params.adminRemark = 'VARICOM_123456';
            }
            CommRestService.post('order/receiveUpdate', params, function (data) {
                TipService.add('success', '备注保存成功', 3000);
            }, function (err) {
                TipService.add('warning', err.msg, 3000);
            });
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


    function StatusFilter() {//1.待付款、2.代发货、3.待收货、4.交易完成、5.删除 6 取消 7:评价完成 8:退款 10：支付中 11：失效订单
        return function (input) {
            switch (input) {
                case 1:
                    return '待付款';
                case 2:
                    return '待发货';
                case 3:
                    return '已发货';
                case 4:
                    return '交易完成';
                case 5:
                    return '已删除';
                case 6:
                    return '已取消';
                case 7:
                    return '已评价';
                case 8:
                    return '已退款';
                case 10:
                    return '支付中';
                case 11:
                    return '失效订单';
            }
        };
    }

})
();