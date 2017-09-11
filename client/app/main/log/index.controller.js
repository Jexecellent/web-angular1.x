/**
 * Created by hxl on 2016/1/7.
 */
;(function(){
    'use strict'
    angular.module('main.log')
        .controller('logIndexController',fLogIndexController)
        ;

    fLogIndexController.$inject = ['$scope','$rootScope','$timeout','logService'];
    function fLogIndexController($scope,$rootScope,$timeout,logService) {
        init();
        function init() {
            $scope.params = {pageSize:20, pageNumber:1,rid:null};
            $scope.op_users = [{id:null,nickname:'全部'}];
            loadData();
            pageConf();
            onPageInitProcessSuccess();

            var fixTh = angular.element("#logTool").outerHeight();
            if (fixTh > 0) {
                angular.element("#logCntBox").css({"padding-top": fixTh});
                //$("#logCntBox").mCustomScrollbar();
            }
        }

        function loadUsers() {
            logService.user_list({pageSize:999, pageNumber:1,op:'1,2',inApp:true},function(data) {
                $scope.op_users = $scope.op_users.concat(data.content);
                console.log('get users ', data, $scope.op_users);
            });
        }

        function loadData(){
            $scope.$parent.loading = true;
            logService.list($scope.params,function(data){
                $scope.data = data;
                $scope.$parent.loading = false;
                logService.processLogData(data.content);
            });
        }

        $scope.search = function(_new) {
            if(_new) {
                $scope.params.pageNumber = 1;
            }
            loadData();
        }
        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            loadData();
        }
        $scope.export = function() {

            //var _params = angular.copy($scope.params);
            //_params.pageSize = 9999;
            //_params.pageNumber = 1;
            //_params.fileName = '操作管理列表';
            //logService.export(_params,function(data){
            //    if (data.ret == 0){
            //        location.href = data.excel;
            //    }
            //    else{
            //        vcAlert("出错了，原因："+data.err);
            //    }
            //});

            // post '/api/log/export'
            $rootScope.exportExcel('log/export', [{name:'pageSize',value:9999},{name:'pageNumber',value:1},{name:'fileName',value:'操作管理列表'}]);
        };

        function pageConf() {
            loadUsers();
            $scope.startDateConf = {'realDateFmt':'yyyy-MM-dd','realTimeFmt':'HH:mm',
                'startDate':'%y-%M-{%d} %H:%m',dateFmt: "yyyy-MM-dd HH:mm",
                maxDate:"#F{$dp.$D(\'log_end_time\')}"};
            $scope.endDateConf = {realDateFmt:'yyyy-MM-dd',realTimeFmt:'HH:mm',
                'startDate':'%y-%M-{%d} %H:%m',dateFmt: "yyyy-MM-dd HH:mm",
                'minDate':"#F{$dp.$D(\'log_start_time\')}"};
        }
        function onPageInitProcessSuccess() {
            $timeout(function(){
                watch();
            },0);
        }
        function watch() {
            $scope.$watch('params.rid',function(_new, _old) {
                $scope.search(true);
            });

            $scope.$watch('params._starTime',function(_new){
                if(typeof(_new) === 'undefined'){
                    return;
                }
                if(_new) {
                    $scope.params.startTime = moment(_new)._d.getTime();
                }else {
                    $scope.params.startTime = null;
                }
                $scope.search(true);
            });
            $scope.$watch('params._endTime',function(_new){
                if(typeof(_new) === 'undefined'){
                    return ;
                }
                if(_new) {
                    $scope.params.endTime = moment(_new)._d.getTime();
                }else {
                    $scope.params.endTime = null;
                }
                $scope.search(true);
            });
        }
    }

})();