/**
 * Created by wayky on 16/1/5.
 */
;(function() {

    'use strict';

    var app = angular.module('openApp');

    //选择商品规格
    app.controller('SelectGoodsSpecController', SelectGoodsSpecController);

    function SelectGoodsSpecController($scope, CommRestService) {


        $scope.getData = function() {
            $scope.goodsSpecList = store.get('goodsSpec');
            if (_.isUndefined($scope.goodsSpecList)) {
                CommRestService.post('goods/specificationList', {}, function(d) {
                    $scope.goodsSpecList = d;
                    doList($scope.goodsSpecList);
                });
            } else {
                doList($scope.goodsSpecList);
            }
        };

        function doList(list) {
            if (list && list.length > 0) {
                if (_.isArray($scope.selectedSpec) && $scope.selectedSpec.length !== 0) {
                    _.each(list, function(gSpec) {
                        _.each($scope.selectedSpec, function(s) {
                            //匹配勾选
                            if (gSpec.id === s.id) {
                                gSpec.$checked = true;
                            }else if(gSpec.name === s.key){
                                gSpec.$checked = true;
                            }
                        });
                    });
                }

            }
        }

        //选择规格
        $scope.checkedSpec = function(spec) {
            spec.$checked = !spec.$checked;
            if (spec.$checked) {
                $scope.selectedSpec.push(spec);
            } else {
                _.remove($scope.selectedSpec, function(n) {
                    var val = n.name || n.key;
                    return val === spec.name;
                });
            }
        };

    }

})();