/**
 * Created by hxl on 2015/12/1.
 */
;(function() {
    'use strict'
    angular.module('main.home')
        .controller('refundActivityController', fRefundActivityController)
        .factory('refundActivityService',fRefundActivityService)
        .controller('joinActivityAuditHomeController', fJoinActivityAuditHomeController)
        .factory('joinActivityAuditHomeService',fJoinActivityAuditHomeService)
        .factory('activityJoinListHomeQueryService',fActivityJoinListHomeQueryService)
        .controller('activityJoinAuditHomeController',fActivityJoinAuditHomeController);
    /**
     * 活动名单退款
     * @param commonModalService
     * @returns {*}
     */
    function fRefundActivityService(commonModalService) {
        var _config = {
            controller  :   'refundActivityController',
            templateUrl :   'app/templates/activity/join_activity_refund.html',
            container   :   '.o_u_home'
        };
        return commonModalService(_config);
    }
    fRefundActivityService.$inject = ['commonModalService'];

    /**
     * 待审核名单service
     * @param commonModalService
     * @returns {*}
     */
    function fJoinActivityAuditHomeService(commonModalService) {
        var _config = {
            controller  :   'joinActivityAuditHomeController',
            templateUrl :   'app/templates/activity/join_activity_audit_home.html',
            container   :   '.o_u_home'
        };
        return commonModalService(_config);
    }
    fJoinActivityAuditHomeService.$inject = ['commonModalService'];

    /**
     * 主页活动退款
     * @param $scope
     */
    function fRefundActivityController($scope,$rootScope,refundActivityService,CommRestService,vcModalService,
                                       dateTimeService,CacheService) {
        $scope.joinupdatePerminssion = CacheService.hasPermission('activity:joinupdate');
        $scope.close = function() {
            refundActivityService.deactivate();
        };
        $scope.params = {pageNumber:1, pageSize:10,payState:2};
        function search() {
            CommRestService.post('activity/join_list',$scope.params,function(data) {
                $scope.data = data;
                $scope.idCode = false;
                _.each(data,function(n) {
                    if(n.idCode) {
                        $scope.idCode = true;
                    }
                });
            });
        }
        search();
        $scope.search = function(e) {
            search();
        }

        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search();
        }
        /**
         * 导出excel
         */
        $scope.export = function() {
            var fileName = "退款名单";
            var _cur_user = CacheService.getObject('current_user');
            if(_cur_user) {
                if(!_.isObject(_cur_user)) {
                    _cur_user = JSON.parse(_cur_user);
                }
                fileName = _cur_user.iname+"-退款名单";
            }

            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = fileName;
            $rootScope.exportExcel("activity/join_export", _params);
        }

        var _cur_join = null;
        /**
         * 退款
         */
        $scope.refund = function(join) {
            _cur_join = join;
            vcModalService({
                retId:'params',backdropCancel: true,title: '退款',
                css: {height: '254px',width: '320px'},
                template: '<p style="text-align: center;">点击确认按钮完成退款操作</p>' +
                '<p style="text-align: center;">此用户将从本次活动名单中退出</p>',
                success: {label: '确认',fn: refundAction}
            },{
                join:join
            });
            setTimeout(function(){
                var z_index = (new Date().getTime()) - dateTimeService.getTimeUpToNow(0);
                angular.element('.o_pop').css({'z-index':z_index});
            },0);
        }
        function refundAction() {
            var _params = {activityId:_cur_join.activityId,joinId:_cur_join.id,opType:2};
            CommRestService.post('activity/join_update',_params,function(data){
                search();
            });
        }
    }
    fRefundActivityController.$inject = ['$scope','$rootScope','refundActivityService','CommRestService','vcModalService',
        'dateTimeService','CacheService'];

    /**
     * 待审核名单列表
     * @param $scope
     * @param joinActivityAuditHomeController
     */
    function fJoinActivityAuditHomeController($scope,$rootScope,$interval, joinActivityAuditHomeService,CommRestService,
                                              activityJoinListHomeQueryService,vcModalService,dateTimeService,
                                              CacheService) {
        $scope.joinupdatePerminssion = CacheService.hasPermission('activity:joinupdate');
        $scope.close = function() {
            joinActivityAuditHomeService.deactivate();
        };

        $scope.params = {pageNumber:1, pageSize:10,payState:4};
        function search() {
            CommRestService.post('activity/join_list',$scope.params,function(data) {
                $scope.data = data;
                $scope.idCode = false;
                _.each(data,function(n) {
                    if(n.idCode) {
                        $scope.idCode = true;
                    }
                });
            });
        }
        search();
        $scope.search = function(e) {
            search(true);
        }

        $scope.go = function(num) {
            $scope.params.pageNumber = num;
            search();
        }
        /**
         * 导出excel
         */
        $scope.export = function() {
            var fileName = "待审核名单";
            var _cur_user = CacheService.getObject('current_user');
            if(_cur_user) {
                if(!_.isObject(_cur_user)) {
                    _cur_user = JSON.parse(_cur_user);
                }
                fileName = _cur_user.iname+"-待审核名单";
            }

            var _params = angular.copy($scope.params);
            _params.pageSize = 99999;
            _params.pageNumber = 1;
            _params.fileName = fileName;
            $rootScope.exportExcel("activity/join_export", _params);
        }

        $scope.audit = function(join) {
            $scope._cur_join = join;
            var z_index = (new Date().getTime()) - dateTimeService.getTimeUpToNow(0);
            vcModalService({
                retId:'params',backdropCancel: true,title: '审核意见',
                css: {height: '315px',width: '400px','z-index':z_index},
                templateUrl: 'app/templates/activity/join_activity_audit.html',controller: 'activityJoinAuditHomeController',
                success: {
                    label: '审核通过',fn: pass
                },cancel:{
                    label:'不通过',fn  : unpass
                }
            },{
                join:join
            });
            setTimeout(function(){
                var _pop = angular.element('.o_pop');
                _pop.css({'z-index':z_index});
                if(_pop || _pop.length === 0){
                    var _o_popInterval = $interval(function(){
                        var _pop = angular.element('.o_pop');
                        if(_pop && _pop.length > 0) {
                            angular.element('.o_pop').css({'z-index':z_index});
                            $interval.cancel(_o_popInterval);
                        }
                    },100);
                }
            },0);
        }
        /**
         * 审核通过
         */
        function pass(params) {
            if(activityJoinListHomeQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:3,audit:params.text};
                activityJoinListHomeQueryService.update(_params,function(){
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
            if(activityJoinListHomeQueryService.validateAuditInfo(params)) {
                var _params = {activityId:params.join.activityId,joinId:params.join.id,
                    opType:4,audit:params.text};
                activityJoinListHomeQueryService.update(_params,function(){
                    search();
                });
                return true;
            }else {
                return false;
            }
        }
    }
    fJoinActivityAuditHomeController.$inject = ['$scope','$rootScope','$interval','joinActivityAuditHomeService','CommRestService',
    'activityJoinListHomeQueryService','vcModalService','dateTimeService','CacheService'];

    /**
     * 活动报名列表查询service
     * @param CommRestService
     * @returns {{list: Function}}
     */
    function fActivityJoinListHomeQueryService(CommRestService,TipService) {
        return {
            list:function(params, callback) {
                CommRestService.post('activity/join_list', params, callback,function(err){
                    TipService.add('error','名单列表异常:'+err.msg,3000);
                });
            },
            update:function(params, callback,failure) {
                CommRestService.post('activity/join_update',params,callback,failure);
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
            },
            export:function(params, cb) {
                CommRestService.post('activity/join_export', params, cb);
            }
        };
    }
    fActivityJoinListHomeQueryService.$inject = ['CommRestService','TipService'];

    /**
     * 审核报名ctrl
     * @param $scope
     */
    function fActivityJoinAuditHomeController($scope) {
        $scope.params = {text:'',join:$scope.join};
    }
    fActivityJoinAuditHomeController.$inject = ['$scope'];
})();