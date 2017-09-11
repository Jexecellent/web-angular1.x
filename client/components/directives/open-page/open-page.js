/**
 * Created by hxl on 2015/11/10.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .directive('openPage',fOpenPage);

    function fOpenPage() {
        return {
            'restrict'  :   'AE',
            'scope'   :   {
                data    :   '=',
                params  :   '=',
                url     :   '@',
                showPageNum   :   '@',//共显示多少页
                goPage  :   '&'
            },
            replace :true,
            templateUrl :   'components/directives/open-page/open-page.html',
            controller  :   fOpenPageController
        };
    }

    function fOpenPageController($scope) {
        $scope.go = function(num) {
            if($scope.goPage) {
                $scope.goPage.call(this,{num:num});
            }
        }
        /**
         * 分页处理函数
         */
        function pageHandler() {
            $scope.pageLine = [];//要显示的所有页
            if(!$scope.data && $scope.data.length > 0) {
                return;
            }
            if($scope.data.totalPages === 1) {//只有一页的话不显示页数
                return;
            }
            var _odd = false;//奇数
            if(0 !== $scope.showPageNum%2) {
                _odd = true;
            }
            $scope.showPageNum = parseInt($scope.showPageNum);
            var _mid = parseInt($scope.showPageNum/2);
            if(_odd) {
                _mid += 1;
            }
            var _start = 1,//起始页
                _last = 0;//终止页

            if($scope.showPageNum <=1) {
                _start = $scope.data.pageNumber;
                _last = $scope.data.pageNumber;
            }else if($scope.data.totalPages && $scope.data.totalPages <= $scope.showPageNum) {
                _start = 1;
                _last = $scope.data.totalPages;
            }else if($scope.data.totalPages){
                if($scope.data.pageNumber) {
                    if(($scope.data.pageNumber - _mid) <= 1) {
                        _start = 1;
                    }else {
                        if(_odd) {
                            _start = $scope.data.pageNumber - _mid+1;
                        }else {
                            _start = $scope.data.pageNumber - _mid;
                        }
                    }
                    if(_start === 1) {
                        _last = $scope.showPageNum;
                    }else {
                        _last = $scope.data.pageNumber + _mid -1;
                    }
                    if(_last > $scope.data.totalPages) {
                        _last = $scope.data.totalPages;
                    }
                }
            }
            if(_start <= _last) {
                for(var i= _start;i <= _last; i++) {
                    $scope.pageLine.push({
                        index:i
                    });
                }
            }else {
            }
        }
        $scope.$watch('data',function(newVal, oldVal){
            if($scope.data && !_.isUndefined($scope.data.pageNumber)) {
                pageHandler();
            }
        });
    }

    fOpenPageController.$inject = ['$scope'];
})();