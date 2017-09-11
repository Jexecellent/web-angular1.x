/**
 * Created by wayky on 16/1/5.
 */
;(function () {

    'use strict';

    var app = angular.module('openApp');

    //选择商品规格
    app.controller('SelectGoodsController', ['$scope','CommRestService','CacheService','GoodsTypeService',SelectGoodsController]);

    function SelectGoodsController($scope, CommRestService, CacheService, GoodsTypeService) {

        //特殊处理
        var updateModalHeight = function(len){
            if (len > 0) {
                var curH = $(".ec_tc_popMain").height();
                var newH = curH + len * 30;
                $(".ec_tc_popMain").attr("style", "height:" + newH + "px");
            }
        };

        //选中的链接
        $scope.selectedLinkData = {};

        $scope.selectedType = 0;
        $scope.selectTypeOption = [{id:0,name:'商品分类'},{id:1,name:'品牌分类'}];

        //一二级分类
        $scope.goodsTypes = [];
        //二级下的商品列表
        $scope.goodsTypeItems = {};
        //选中的分类节点
        $scope.selectedGoodTypeId = 0;
        $scope.chooseGoodsTypeNode = function(typeInfo, isSubType){
            var typeId = typeInfo.typeId;
            $scope.selectedGoodTypeId = typeId;
            //构造选中链接
            $scope.selectedLinkData = {
                title: typeInfo.name,
                typeId:typeId,
                link: "http://_varicom.im/aid/27/?typeId=" + typeId,
                aidType: 27
            };
            //异步加载该分类下的商品列表
            if (isSubType && !$scope.goodsTypeItems[typeId]) {
                CommRestService.post('goods/list', {
                    status: 1,
                    pageSize: 100,
                    pageNumber: 1,
                    typeId: typeId
                }, function(data) {
                    if (data) {
                        $scope.goodsTypeItems[typeId] = data.content;
                        //if ($scope.updateScroll) {
                        //    $scope.updateScroll();
                        //}
                        updateModalHeight(data.content.length);
                    }
                }, function(err) {
                    $scope.goodsTypeItems[typeId] = [];
                });
            }
        };

        //品牌
        $scope.goodsBrands = [];
        //品牌下的商品列表
        $scope.goodsBrandItems = {};
        //选中的分类节点
        $scope.selectedBrandId = 0;
        $scope.chooseBrandNode = function(brand){
            var brandId = brand.id;
            $scope.selectedBrandId = brandId;
            //构造选中链接
            $scope.selectedLinkData = {
                title: brand.name,
                brandId: brandId,
                link: "http://_varicom.im/aid/27/?brandId=" + brandId,
                aidType: 27
            };
            //异步加载该分类下的商品列表
            if (!$scope.goodsBrandItems[brandId]) {
                CommRestService.post('goods/list', {
                    status: 1,
                    pageSize: 100,
                    pageNumber: 1,
                    brandId: brandId
                }, function(data) {
                    if (data) {
                        $scope.goodsBrandItems[brandId] = data.content;
                        //if ($scope.updateScroll) {
                        //    $scope.updateScroll();
                        //}
                        updateModalHeight(data.content.length);
                    }
                }, function(err) {
                    $scope.goodsBrandItems[brandId] = [];
                });
            }
        };

        //选中具体的商品
        $scope.selectedGoodsId = 0;
        $scope.chooseOneGood = function(goodsInfo){
            $scope.selectedGoodTypeId = 0;
            $scope.selectedBrandId = 0;
            $scope.selectedGoodsId = goodsInfo.id;
            $scope.selectedLinkData = {
                title: goodsInfo.name,
                goodsId: goodsInfo.id,
                link: "http://_varicom.im/aid/26/?goodsId=" + goodsInfo.id,
                aidType: 26
            };
        };

        //加载一二级分类
        var loadGoodTypesAndSubTypes = function(cb){
            GoodsTypeService.goodsTypeTrie(cb);
        };

        //加载品牌分类
        var loadGoodBrands = function(cb){
            GoodsTypeService.getGoodsBrand(cb);
        };

        $scope.$watch('selectedType', function(newValue, oldValue){
            //展示不同的树
            if (newValue == 0) {
                //按商品分类
                if ($scope.goodsTypes.length == 0) {
                    loadGoodTypesAndSubTypes(function(goodsTypes){
                        $scope.goodsTypes = goodsTypes;
                    });
                }
            }
            else if (newValue == 1) {
                //按品牌分类
                if ($scope.goodsBrands.length == 0) {
                    loadGoodBrands(function(goodsBrands){
                        $scope.goodsBrands = goodsBrands;
                    });
                }
            }
        });
    }

})();