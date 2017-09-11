/**
 * Created by hxl on 2015/12/31.
 */
;(function(){
    'use strict'
    angular.module('main.storeIndex')
        .controller('StoreManageController',fStoreManageController)
        ;

    /**
     * 配置首页ctrl
     * @param $scope
     * @constructor
     */
    fStoreManageController.$inject = ['$scope','vcModalService'];
    function fStoreManageController($scope,vcModalService) {
    }

})();