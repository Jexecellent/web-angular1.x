/**
 * Created by hxl on 2015/11/13.
 */
;(function(){
    'use strict'
    angular.module('openApp')
        .factory('activityJoinListLayoutService', fActivityJoinListLayoutService)
        .controller('activityJoinListController',fActivityJoinListController)
        .factory('cycleActivityJoinListLayoutService', fCycleActivityJoinListLayoutService)
        .controller('cycleActivityJoinListController',fCycleActivityJoinListController)
        .factory('contestActivityJoinListLayoutService', fContestActivityJoinListLayoutService)
        .controller('contestActivityJoinListController',fContestActivityJoinListController)
        .factory('activityJoinListLayoutQueryService', fActivityJoinListLayoutQueryService)
        .controller('activityJoinAuditController',fActivityJoinAuditController);

    /**
     * 普通活动报名列表layout service
     * @param commonModalService
     * @returns {*}
     */
    function fActivityJoinListLayoutService(commonModalService) {
        var _config = {
            controller  :   'activityJoinListController',
            templateUrl :   'app/templates/activity/join_activity_list.html',
            container   :   '.append_parent'
        };
        return commonModalService(_config);
    }
    fActivityJoinListLayoutService.$inject = ['commonModalService'];

    /**
     * 周期活动报名列表layout service
     * @param commonModalService
     * @returns {*}
     */
    function fCycleActivityJoinListLayoutService(commonModalService) {
        var _config = {
            controller  :   'cycleActivityJoinListController',
            templateUrl :   'app/templates/activity/join_cycle_activity_list.html',
            container   :   '.append_parent'
        };
        return commonModalService(_config);
    }
    fCycleActivityJoinListLayoutService.$inject = ['commonModalService'];

    /**
     * 赛事活动报名列表layout service
     * @param commonModalService
     * @returns {*}
     */
    function fContestActivityJoinListLayoutService(commonModalService) {
        var _config = {
            controller  :   'contestActivityJoinListController',
            templateUrl :   'app/templates/activity/join_contest_activity_list.html',
            container   :   '.append_parent'
        };
        return commonModalService(_config);
    }
    fContestActivityJoinListLayoutService.$inject = ['commonModalService'];

    /**
     * 普通活动报名列表ctrl
     * @param $scope
     * @param activityJoinListLayoutService
     * @param activityJoinListLayoutQueryService
     */
    function fActivityJoinListController($scope,$rootScope,activityJoinListLayoutService,activityJoinListLayoutQueryService,
                                         vcModalService,TipService,CacheService) {
        function init() {
            $scope.joinupdatePerminssion = CacheService.hasPermission('activity:joinupdate');
            $scope.is_need_audit = $scope.activity.isNeedCheck;
            //$scope.auditStats = [{name:"待审核",value:2},{name:"审核通过",value:1},{name:"审核不通过",value:3}];
            if($scope.is_need_audit  === 1) {
                if($scope.activity.payType ===1 || $scope.activity.payType ===4) {//需要审核并且免费,线下收费
                    $scope.auditStats = activityJoinListLayoutQueryService.payStatus._auditPayStatus_free;
                }else {
                    $scope.auditStats = activityJoinListLayoutQueryService.payStatus._auditPayStatus;
                }
            }else if($scope.activity.payType !==1){//收费不需要审核
                $scope.auditStats = activityJoinListLayoutQueryService.payStatus._unAuditStatus;
            }
            if($scope.activity_id) {
                $scope.params = {pageSize:10, pageNumber:1, activityId:$scope.activity_id};
                //默认选中待审核
                $scope.params.payState = null;
                search();
            }
            if($scope.activity.assembleInfo) {
                $scope.assembles = JSON.parse($scope.activity.assembleInfo);
            }
            $scope._cur_join = null;
            angular.element('.paging').css({'position':'static'});
        }
        init();//必要的数据
        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search();
        }
        $scope.close = function() {
            activityJoinListLayoutService.deactivate();
            angular.element('.paging').css({'position':'fixed'});
        };

        $scope.search = function(e) {
            search();
        }
        function search() {
            activityJoinListLayoutQueryService.list($scope.params,function(data) {
                var l;
                for(l in data.content) {
                    data.content[l]._show = 0;
                }
                $scope.data = data;
            });
        }
        $scope.edit = function(join) {
            join._show = 1;
        }
        $scope.update = function(join) {
            join._show = 0;
            join.joinId = join.id;
            join.opType = 5;
            join.activityId = $scope.activity_id;
            activityJoinListLayoutQueryService.update(join,function(data){
                TipService.add('success','更新成功',3000);
            });
        }

        $scope.cancleEdit = function(join) {
            join._show = 0;
        }

        /**
         * 取消报名
         * @param join
         */
        $scope.cancelReg = function(join) {

            window.vcAlert({
                title:"提示",
                text: "确认取消报名？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function() {
                var _params = {activityId:$scope.activity_id,joinId:join.id,opType:1};
                activityJoinListLayoutQueryService.update(_params, function(data) {
                    search();
                });
            });
        }

        $scope.$watch('params.payState',function(newVal){
            search();
        });

        /**
         * 审核
         * @param join
         */
        $scope.audit = function(join) {
            $scope._cur_join = join;
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px'},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditController',
                success: {
                    label: '审核通过',fn: pass
                },cancel:{
                    label:'不通过',fn  : unpass
                }
            },{
                join:join
            });
        }
        /**
         * 审核通过
         */
        function pass(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                opType:3,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    search();
                    /*
                    if($scope.activity.cost){//如果是需要支付，审核通过之后变为未支付
                        params.join.payState = 3;
                    }else {
                        params.join.payState = 0;
                    }
                    */
                });
                return true;
            }else {
                return false;
            }
        }

        /**
         * 审核不通过
         */
        function unpass(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:4,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    search();
                });
                return true;
            }else {
                return false;
            }
        }
        /**
         * 导出excel
         */
        $scope.export = function() {

            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = $scope.activity.title;
            /*
            activityJoinListLayoutQueryService.export(_params, function(data){
                if (data.ret == 0){
                    location.href = encodeURI(data.excel);
                }
                else{
                    vcAlert("出错了，原因："+data.err);
                }
            });*/
            //将params转成数组
            $rootScope.exportExcel("activity/join_export", _params);
        };
        /**
         * 拒绝
         * @param join
         */
        $scope.refuse = function(join) {
            $scope._cur_join = join;
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px'},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditController',
                success: {label: '审核通过',fn: refuseAction}
            },{
                join:join
            });
        }
        function refuseAction(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:1,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    _.remove($scope.data.content, function(n) {
                        return n.id === $scope._cur_join.id;
                    });
                },function(err) {
                    TipService.add('error','拒绝此人失败:'+err.msg,3000);
                });
                return true;
            }
            return false;
        }
    }
    fActivityJoinListController.$inject = ['$scope','$rootScope','activityJoinListLayoutService','activityJoinListLayoutQueryService',
    'vcModalService','TipService','CacheService'];

    /**
     * 周期活动报名列表ctrl
     * @param $scope
     * @param cycleActivityJoinListLayoutService
     * @param activityJoinListLayoutQueryService
     * @param vcModalService
     */
    function fCycleActivityJoinListController($scope,$rootScope,cycleActivityJoinListLayoutService,activityJoinListLayoutQueryService,
                                              vcModalService,TipService,CacheService){
        function init() {
            $scope.joinupdatePerminssion = CacheService.hasPermission('activity:joinupdate');
            angular.element('.paging').css({'position':'static'});
            $scope.is_need_audit = $scope.activity.isNeedCheck;
            //$scope.auditStats = [{name:"待审核",value:2},{name:"审核通过",value:1},{name:"审核不通过",value:3}];
            if($scope.is_need_audit  === 1) {
                if($scope.activity.payType ===1||$scope.activity.payType ===4) {//需要审核并且免费,线下收费
                    $scope.auditStats = activityJoinListLayoutQueryService.payStatus._auditPayStatus_free;
                }else {
                    $scope.auditStats = activityJoinListLayoutQueryService.payStatus._auditPayStatus;
                }
            }else if($scope.activity.payType !==1){//收费不需要审核
                $scope.auditStats = activityJoinListLayoutQueryService.payStatus._unAuditStatus;
            }
            $scope.close = function() {
                cycleActivityJoinListLayoutService.deactivate();
                angular.element('.paging').css({'position':'fixed'});
            };
            if($scope.activity_id) {
                $scope.params = {pageSize:10, pageNumber:1, activityId:$scope.activity_id};
                $scope.params.payState = null;
                search();
            }
            if($scope.activity.assembleInfo) {
                $scope.assembles = JSON.parse($scope.activity.assembleInfo) ;
            }
        }
        init();
        var _cur_join = null;
        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search();
        }
        /**
         * 日历配置
         * @type {{firstDayOfWeek: number, onpicking: Function}}
         */
        $scope.my97Conf = {
            firstDayOfWeek:1,
            onpicking:function(dp){
                var pick = moment(dp.cal.getNewDateStr())._d;
                $scope.params.period = pick.getTime();
                search();
            },
            oncleared:function(dp){
                $scope.params.period = null;
                search();
            }
        }
        if($scope.subTags) {
            var _disabledDate = [];
            for(var t in $scope.subTags) {
                if(0 === $scope.subTags[t]) {
                    _disabledDate.push(parseInt(t));
                }
            }
            if(_disabledDate.length > 0) {
                $scope.my97Conf.disabledDays = _disabledDate;
            }
        }

        $scope.search = function(e) {
            search();
        }
        function search() {
            activityJoinListLayoutQueryService.list($scope.params,function(data) {
                var l;
                for(l in data.content) {
                    data.content[l]._show = 0;
                }
                $scope.data = data;
            });
        }
        $scope.edit = function(join) {
            join._show = 1;
        }
        $scope.update = function(join) {
            join._show = 0;
            join.joinId = join.id;
            join.opType = 5;
            join.activityId = $scope.activity_id;
            activityJoinListLayoutQueryService.update(join,function(data){
                TipService.add('success','更新名单成功',3000);
            });
        }
        $scope.cancleEdit = function(join) {
            join._show = 0;
        }
        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search();
        }
        $scope.$watch('params.payState',function(newVal){
            search();
        });
        /**
         * 取消报名
         * @param join
         */
        $scope.cancelReg = function(join) {
            window.vcAlert({
                title:"提示",
                text: "确认取消报名？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function() {
                var _params = {activityId:$scope.activity_id,joinId:join.id,opType:1};
                activityJoinListLayoutQueryService.update(_params, function(data) {
                    search();
                },function(err) {
                    TipService.add('error','取消报名失败:'+err,3000);
                });
            });
        }
        /**
         * 审核
         * @param join
         */
        $scope.audit = function(join) {
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px'},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditController',
                success: {
                    label: '审核通过',fn: pass
                },cancel:{
                    label:'不通过',fn  : unpass
                }
            },{
                join:join
            });
        }
        /**
         * 审核通过
         */
        function pass(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:3,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    search();
                });
                return true;
            }else {
                return false;
            }
        }

        /**
         * 审核不通过
         */
        function unpass(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:4,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    search();
                });
                return true;
            }else {
                return false;
            }
        }
        /**
         * 导出excel
         */
        $scope.export = function() {
            var fileName = $scope.activity.title;
            if($scope.params.period) {
                fileName += moment($scope.params.period).format("YYYY-MM-DD");
            }
            /*
            activityJoinListLayoutQueryService.export(_params, function(data){
                if (data.ret == 0){
                    location.href = data.excel;
                }
                else{
                    vcAlert("出错了，原因："+data.err);
                }
            });
            */
            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = fileName;
            $rootScope.exportExcel("activity/join_export", _params);
        }

        /**
         * 拒绝
         * @param join
         */
        $scope.refuse = function(join) {
            _cur_join = join;
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px'},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditController',
                success: {label: '审核通过',fn: refuseAction}
            },{
                join:join
            });
        }
        function refuseAction(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:1,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    _.remove($scope.data.content, function(n) {
                        return n.id === _cur_join.id;
                    });
                },function(err) {
                    TipService.add('error','拒绝此人失败:'+err.msg,3000);
                });
                return true;
            }
            return false;
        }
    }
    fCycleActivityJoinListController.$inject = ['$scope','$rootScope','cycleActivityJoinListLayoutService','activityJoinListLayoutQueryService',
    'vcModalService','TipService','CacheService'];

    /**
     * 赛事活动报名列表ctrl
     * @param $scope
     * @param contestActivityJoinListLayoutService
     * @param activityJoinListLayoutQueryService
     * @param vcModalService
     */
    function fContestActivityJoinListController($scope,$rootScope,contestActivityJoinListLayoutService,
                                                activityJoinListLayoutQueryService,vcModalService,TipService,
                                                CacheService) {
        function init() {
            $scope.joinupdatePerminssion = CacheService.hasPermission('activity:joinupdate');
            angular.element('.paging').css({'position':'static'});
            //$scope.auditStats = [{name:"待审核",value:2},{name:"审核通过",value:1},{name:"审核不通过",value:3}];
            $scope.is_need_audit = $scope.activity.isNeedCheck;
            if($scope.is_need_audit  === 1) {
                if($scope.activity.payType ===1||$scope.activity.payType ===4) {//需要审核并且免费,线下收费
                    $scope.auditStats = activityJoinListLayoutQueryService.payStatus._auditPayStatus_free;
                }else {
                    $scope.auditStats = activityJoinListLayoutQueryService.payStatus._auditPayStatus;
                }
            }else if($scope.activity.payType !==1){//收费不需要审核
                $scope.auditStats = activityJoinListLayoutQueryService.payStatus._unAuditStatus;
            }
            if($scope.activity_id) {
                $scope.params = {pageSize:10, pageNumber:1, activityId:$scope.activity_id};
                $scope.params.payState = null;
                //search();
            }
            if($scope.eventGroupInfo) {//赛事分组
                $scope.group = [{name:'全部'}];
                $scope.group = $scope.group.concat(JSON.parse($scope.eventGroupInfo));
                $scope.groupVal = $scope.group[0].name;
            }
            if($scope.activity.assembleInfo) {
                $scope.assembles = JSON.parse($scope.activity.assembleInfo);
            }
            $scope._cur_join = null;
        }
        init();
        $scope.close = function() {
            contestActivityJoinListLayoutService.deactivate();
            angular.element('.paging').css({'position':'fixed'});
        };

        $scope.search = function(e) {
            search();
        }
        function search(_new) {
            if(_new) {
                $scope.params.pageNumber = 1;
            }
            activityJoinListLayoutQueryService.list($scope.params,function(data) {
                var l;
                for(l in data.content) {
                    data.content[l]._show = 0;
                }
                $scope.data = data;
            });
        }
        $scope.edit = function(join) {
            join._show = 1;
        }
        $scope.update = function(join) {
            join._show = 0;
            join.joinId = join.id;
            join.opType = 5;
            join.activityId = $scope.activity_id;
            activityJoinListLayoutQueryService.update(join,function(data){
                TipService.add('success','更新名单成功',3000);
            });
        }
        $scope.cancleEdit = function(join) {
            join._show = 0;
        }
        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search();
        }

        $scope.$watch('groupVal',function(newVal){
            if(newVal === '全部'){
                newVal = null;
            }
            $scope.params.groupName = newVal;
            search(true);
        });
        $scope.$watch('params.payState',function(newVal){
            search(true);
        });
        /**
         * 取消活动
         * @param join
         */
        $scope.cancelReg = function(join) {
            window.vcAlert({
                title:"提示",
                text: "确认取消报名？",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                cancelButtonText: "取消",
                confirmButtonText: "确定",
                closeOnConfirm: true,
                html: false
            }, function() {
                var _params = {activityId:$scope.activity_id,joinId:join.id,opType:1};
                activityJoinListLayoutQueryService.update(_params, function(data) {
                    search(false);
                });
            });

        }
        /**
         * 审核
         * @param join
         */
        $scope.audit = function(join) {
            $scope._cur_join = join;
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px'},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditController',
                success: {
                    label: '审核通过',fn: pass
                },cancel:{
                    label:'不通过',fn  : unpass
                }
            },{
                join:join
            });
        }
        /**
         * 审核通过
         */
        function pass(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:3,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    search(false);
                });
                return true;
            }else {
                return false;
            }
        }

        /**
         * 审核不通过
         */
        function unpass(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:4,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    search(false);
                });
                return true;
            }else {
                return false;
            }
        }

        /**
         * 导出excel
         */
        $scope.export = function() {
            /*
            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = $scope.activity.title+"-"+$scope.groupVal;
            activityJoinListLayoutQueryService.export(_params, function(data){
                if (data.ret == 0){
                    location.href = data.excel;
                }
                else{
                    vcAlert("出错了，原因："+data.err);
                }
            });
            */
            var fileName = $scope.activity.title + "-" + $scope.groupVal;
            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = fileName;

            $rootScope.exportExcel("activity/join_export", _params);
        }
        /**
         * 拒绝
         * @param join
         */
        $scope.refuse = function(join) {
            $scope._cur_join = join;
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px'},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditController',
                success: {label: '审核通过',fn: refuseAction}
            },{
                join:join
            });
        }
        function refuseAction(params) {
            if(activityJoinListLayoutQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:1,audit:params.text};
                activityJoinListLayoutQueryService.update(_params,function(){
                    _.remove($scope.data.content, function(n) {
                        return n.id === $scope._cur_join.id;
                    });
                },function(err) {
                    TipService.add('error','拒绝此人失败:'+err.msg,3000);
                });
                return true;
            }
            return false;
        }
    }
    fContestActivityJoinListController.$inject = ['$scope','$rootScope','contestActivityJoinListLayoutService','activityJoinListLayoutQueryService',
        'vcModalService','TipService','CacheService'];

    /**
     * 活动报名列表查询service
     * @param CommRestService
     * @returns {{list: Function}}
     */
    function fActivityJoinListLayoutQueryService(CommRestService,TipService) {
        var _unAuditStatus = [{name:"全部",value:null},{name:"等待退款",value:2},{name:"已付款",value:1},
            {name:"已退款",value:11}];

        var _auditPayStatus_free = [{name:"全部",value:null},{name:"等待审核",value:4},{name:"审核通过",value:0}
        ,{name:"审核不通过",value:12}];

        var _auditPayStatus = [{name:"全部",value:null},{name:"等待审核",value:4},{name:"已通过-未付款",value:5},
            {name:"审核不通过",value:12},{name:"已付款",value:1},{name:"等待退款",value:2},
            {name:"已退款",value:11}];

        var _payStatus = {
            _unAuditStatus:_unAuditStatus,
            _auditPayStatus_free:_auditPayStatus_free,
            _auditPayStatus:_auditPayStatus
        };
        return {
            payStatus:_payStatus,
            list:function(params, callback) {
                CommRestService.post('activity/join_list', params, callback,function(err) {
                    TipService.add('error','获取名单列表失败:'+err.msg,3000);
                });
            },
            update:function(params, callback,failure) {
                CommRestService.post('activity/join_update',params,callback,failure||function(err){
                        TipService.add('error','操作失败:'+err.msg,3000);
                });
            },
            validateAuditInfo:function(params) {
                return true;
                /*
                if(!params.text) {
                    return false;
                }else if(params.text.length > 30) {
                    return false;
                }else {
                    return true;
                }*/
            }/*,
            export:function(params, cb) {
                CommRestService.post('activity/join_export', params, cb, function() {
                    TipService.add('error','名单导出失败',3000);
                });
            }*/
        };
    }
    fActivityJoinListLayoutQueryService.$inject = ['CommRestService','TipService'];

    /**
     * 审核报名ctrl
     * @param $scope
     */
    function fActivityJoinAuditController($scope) {
        $scope.params = {text:'',join:$scope.join};
    }
    fActivityJoinAuditController.$inject = ['$scope'];
})();