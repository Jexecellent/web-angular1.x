/**
 *  main.goodsMgr Module
 *
 * 商品管理 Description
 */
;
(function () {
    'use strict';
    angular.module('main.goodsMgr')
        .controller('GoodsManagerController', GoodsManagerController)
        .controller('GoodsListController', GoodsListController)
        .controller('GoodsListEditController', GoodsListEditController);


    //入口
    function GoodsManagerController() {
    }

    GoodsManagerController.$inject = ['$scope'];

    //列表
    function GoodsListController($scope, CommRestService, GoodsTypeService, CommTabService, TipService, vcModalService, CacheService, previewModalService) {

        $scope.status = 0;
        $scope.params = {
            pageSize: 10,
            pageNumber: 0
        };
        $scope.goodsList = [];
        $scope.op = {};
        $scope.edit = {}; //列表快捷编辑

        GoodsTypeService.goodsTypeTrie(function (gt) {
            $scope.parentLevel = angular.copy(gt);
            $scope.edit.parentLevel = angular.copy(gt);
        });

        GoodsTypeService.getGoodsBrand(function (data) {
            $scope.brandList = angular.copy(data);
            $scope.edit.brandList = angular.copy(data);
        });

        $scope.vcTabOnload = function (data, fromIndex) {
            if ($scope.$dirty) {
                $scope.op.showQuery = false; //初始不显示筛选区域
                $scope.loadData($scope.params.pageNumber);
                $scope.$dirty = false;
            }
        };

        $scope.preview = function (goodsId) {
            CommRestService.post('goods/get', {goodsId: goodsId}, function (detail) {
                CacheService.putObject('preview_goods', detail);
                var curTime = new Date().getTime();
                previewModalService.activate({
                    f_src: '/assets/preview/goods/index.html?r=' + curTime
                });
            }, function () {
            });

        };

        $scope.loadData = function (pageNo) {

            this.params.pageNumber = 0;
            $scope.$parent.loading = true;
            pageNo ? (this.params.pageNumber = parseInt(pageNo)) : this.params.pageNumber++;
            if (!this.params.status) {
                this.params.status = this.status;
            }

            CommRestService.post('goods/list', $scope.params, function (data) {
                if (data) {
                    //根据id格式出分类/品牌名称
                    _.each(data.content, function (dt) {
                        dt.typeName = GoodsTypeService.getTypeNameByTypeId(dt.typeId);
                        dt.brandName = GoodsTypeService.getBrandNameById($scope.brandList, dt.brandId);
                    });
                    $scope.goodsList = data.content;
                    $scope.pager = {
                        firstPage: data.firstPage,
                        lastPage: data.lastPage,
                        totalPages: data.totalPages,
                        pageNumber: data.pageNumber
                    };
                }
                $scope.$parent.loading = false;
            }, function (err) {
                window.vcAlert(err.msg);
                $scope.goodsList = [];
                $scope.pager = {};
                $scope.$parent.loading = false;
            });
        };

        $scope.openQuery = function () {
            $scope.op.showQuery = !$scope.op.showQuery;
            //调整高度
            $scope.$vcUpdateTabScroller();

            //$scope.parentLevel = $scope.$parent.parentLevel;
            //$scope.brandList = $scope.$parent.brandList;
            //$scope.op.typeId = 0;
            //$scope.op.brandId = 0;
        };


        $scope.changeParentLevel = function (info) {
            $scope.childLevel = GoodsTypeService.getChildLevel($scope.parentLevel, info.value);
            if (!_.find($scope.childLevel, function (pl) {
                    return pl.id === 0;
                })) {
                $scope.childLevel.unshift({
                    id: 0,
                    name: '全部二级分类'
                });
            }
            $scope.op.childTypeId = 0;
        };

        $scope.formatQueryInfo = function () {
            //typeId
            if (!_.isUndefined(validUndefined($scope.op.typeId)) && !_.isUndefined(validUndefined($scope.op.childTypeId))) {
                $scope.params.typeId = GoodsTypeService.getTypeIdById(store.get('goodsType'), $scope.op.childTypeId);
            } else {
                delete $scope.params.typeId;
            }

            //品牌
            if (!_.isUndefined(validUndefined($scope.op.brandId))) {
                $scope.params.brandId = $scope.op.brandId;
            } else {
                delete $scope.params.brandId;
            }

            //上架时间
            if ($scope.op.startOnlineTime !== null && $scope.op.startOnlineTime !== undefined) {
                $scope.params.startOnlineTime = moment($scope.op.startOnlineTime)._d.getTime();
            } else {
                delete $scope.params.startOnlineTime;
            }
            if ($scope.op.endOnlineTime !== null && $scope.op.endOnlineTime !== undefined) {
                $scope.params.endOnlineTime = moment($scope.op.endOnlineTime)._d.getTime();
            } else {
                delete $scope.params.endOnlineTime;
            }

            $scope.loadData();
            //关闭筛选
            $scope.openQuery();
        };

        function validUndefined(validInfo) {
            if (!angular.isUndefined(validInfo) && validInfo !== null && validInfo !== 0) {
                return validInfo;
            }
        }

        //清空筛选区域查询条件
        $scope.clearQueryInfo = function () {
            $scope.op = {
                showQuery: $scope.op.showQuery,
                typeId: 0,
                brandId: 0
            };
            $scope.childLevel = [];
            $scope.params = {
                pageSize: 10,
                pageNumber: 0
            };
            if (!this.params.status) {
                this.params.status = this.status;
            }

        };

        //修改是否推荐(商品)
        $scope.changeRecommend = function (goods) {
            var recommendParams = {
                    goodsId: goods.id,
                    type: 1
                },
                reUri = '';
            if (goods.isRecommend === true) {
                reUri = 'goods/recommendDel';
            } else {
                reUri = 'goods/recommendAdd';
                recommendParams.typeId = goods.typeId;
            }
            CommRestService.post(reUri, recommendParams, function (res) {
                $scope.loadData($scope.params.pageNumber);
            });
        };

        //商品编辑
        $scope.editGoods = function (goodsId, type) {
            CommTabService.next($scope.$vcTabInfo, 1, {
                operate: type,
                dataId: goodsId
            }, 'goodsMgr');
        };

        //商品下线
        $scope.offlineGoods = function (goodsId) {
            window.vcAlert({
                title: '下架商品',
                text: '确认下线此商品吗?',
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                cancelButtonText: '取消',
                confirmButtonText: '确定',
                closeOnConfirm: true,
                html: false
            }, function () {
                CommRestService.post('goods/offline', {
                    goodsId: goodsId
                }, function () {
                    TipService.add('success', '商品下架成功', 3000);
                    //通知下线列表和线上列表数据更新
                    CommTabService.next($scope.$vcTabInfo, 'online', {}, ['online', 'offline']);
                }, function (err) {
                    TipService.add('danger', err.msg, 3000);
                });
            });
        };


        //列表快递修改
        $scope.goodsEditList = function (editType, editInfo, goodsId) {
            var modelTitle = '';
            $scope.edit.id = goodsId;
            $scope.edit.type = editType;
            $scope.edit.info = editInfo;
            switch (editType) {
                case 'editType':
                    modelTitle = '修改分类';
                    break;
                case 'editBrand':
                    modelTitle = '修改品牌';
                    break;
                case 'editCommission':
                    modelTitle = '修改佣金';
                    break;
                case 'editRealPrice':
                    modelTitle = '修改原价';
                    break;
                case 'editNumber':
                    modelTitle = '修改库存';
                    break;
            }


            vcModalService({
                retId: 'edit',
                backdropCancel: false,
                title: modelTitle,
                css: {
                    height: '300px',
                    width: '300px'
                },
                templateUrl: 'app/main/goodsMgr/pages/list_editInfo.html',
                controller: 'GoodsListEditController',
                success: {
                    label: '确定',
                    fn: sureEdit
                }
            }, {
                edit: $scope.edit || {}
            });

        };

        function sureEdit(res) {
            var editData = {
                id: res.id
            };
            console.log(res);
            switch (res.type) {
                case 'editType':
                    if (!_.isUndefined(res.typeId) && !_.isUndefined(res.childTypeId)) {
                        editData.typeId = GoodsTypeService.getTypeIdById(store.get('goodsType'), res.childTypeId);
                    } else {
                        editData.typeId = GoodsTypeService.getTypeIdById(store.get('goodsType'), res.typeId);
                    }
                    editPost(editData, '分类');
                    break;
                case 'editBrand':
                    editData.brandId = res.info;
                    editPost(editData, '品牌');
                    break;
                case 'editCommission':
                    editData.commission = res.info;
                    editPost(editData, '佣金');
                    break;

            }
        }

        function editPost(ed, editType) {
            CommRestService.post('goods/updateBase', ed, function (data) {
                TipService.add('success', editType + '修改成功', 3000);
                $scope.loadData($scope.params.pageNumber);
            });
        }
    }

    GoodsListController.$inject = ['$scope', 'CommRestService', 'GoodsTypeService', 'CommTabService', 'TipService', 'vcModalService', 'CacheService', 'previewModalService'];

    //快捷修改
    function GoodsListEditController($scope, GoodsTypeService) {

        var leveNodes = angular.copy($scope.edit.parentLevel);

        if ($scope.edit.type === 'editType') {
            var levelIds = GoodsTypeService.getParentLevelByTypeId($scope.edit.info);
            $scope.edit.parentLevel = $scope.edit.parentLevel;
            $scope.edit.childLevel = GoodsTypeService.getChildLevel($scope.edit.parentLevel, levelIds[1]);
            $scope.edit.typeId = levelIds[1];
            $scope.edit.childTypeId = levelIds[0];

        }

        //分类联动查询: 选择一级下的二级分类
        $scope.changeParentLevel = function (info) {
            $scope.edit.childLevel = GoodsTypeService.getChildLevel(leveNodes, info.value);
        };

    }

    GoodsListEditController.$inject = ['$scope', 'GoodsTypeService'];

})();